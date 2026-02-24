import { createServer } from "node:net";

import Aedes from "aedes";
import websocketStream from "websocket-stream";
import { WebSocketServer } from "ws";

import { config } from "@/config";

import { authenticateMqttClient, authorizePublish, authorizeSubscribe, SERVER_CLIENT_ID } from "./auth";

import type { Client } from "aedes";
import type { Server as HttpServer } from "node:http";

// Redis-based persistence and message queue (optional, comment out if Redis not available)
// import mq from 'mqemitter-redis';
// import persistence from 'aedes-persistence-redis';

/**
 * Optional event handlers for MQTT broker
 */
export interface MqttBrokerHandlers {
  /**
   * Called when a new client connects (excluding server publisher)
   * @param client - The connected client
   */
  onClientConnect?: (client: Client) => void;

  /**
   * Called when a client disconnects
   * @param client - The disconnected client
   */
  onClientDisconnect?: (client: Client) => void;

  /**
   * Called when a client error occurs
   * @param client - The client that encountered an error
   * @param error - The error that occurred
   */
  onClientError?: (client: Client, error: Error) => void;
}

let aedesInstance: Aedes;

export function createMqttBroker(httpServer: HttpServer, mqttPort: number = 1883, handlers?: MqttBrokerHandlers) {
  // Initialize Aedes broker with authentication and authorization
  aedesInstance = new Aedes({
    authenticate: authenticateMqttClient,
    authorizePublish,
    authorizeSubscribe,

    // For production with Redis, uncomment the persistence and mq options:
    // persistence: persistence({
    //   host: process.env.REDIS_HOST || 'localhost',
    //   port: parseInt(process.env.REDIS_PORT || '6379'),
    //   ttl: {
    //     packets: 300,  // 5 minutes
    //     subscriptions: 300,
    //   }
    // }),
    // mq: mq({
    //   host: process.env.REDIS_HOST || 'localhost',
    //   port: parseInt(process.env.REDIS_PORT || '6379'),
    // }),
  });

  // MQTT over TCP (for native MQTT clients)
  const mqttServer = createServer(aedesInstance.handle);

  mqttServer.listen(mqttPort, () => {
    console.log(`🔌 MQTT Broker (TCP) listening on port ${mqttPort}`);
  });

  // MQTT over WebSocket (for browser clients)
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/mqtt",
  });

  wss.on("connection", (ws, req) => {
    // @ts-expect-error - websocket-stream types issue with ws v8
    const stream = websocketStream(ws);
    aedesInstance.handle(stream);
    console.log(`🌐 WebSocket connection from ${req.socket.remoteAddress}`);
  });

  console.log(`🌐 MQTT WebSocket available at ws://localhost/mqtt`);

  // Broker event handlers
  aedesInstance.on("client", (client) => {
    // Check if this is the server publisher
    const isServerPublisher = client.id === SERVER_CLIENT_ID;

    console.log(`✅ Client connected: ${client.id}${isServerPublisher ? " (server publisher)" : ""} ` + `(Total: ${aedesInstance.connectedClients})`);

    // Call custom handler only for non-server clients
    if (!isServerPublisher && handlers?.onClientConnect) {
      handlers.onClientConnect(client);
    }
  });

  aedesInstance.on("clientDisconnect", (client) => {
    console.log(`❌ Client disconnected: ${client.id}`);

    // Call custom handler
    if (handlers?.onClientDisconnect) {
      handlers.onClientDisconnect(client);
    }
  });

  aedesInstance.on("subscribe", (subscriptions, client) => {
    console.log(
      `📥 Client ${client.id} subscribed to:`,
      subscriptions.map((s) => s.topic)
    );
  });

  aedesInstance.on("publish", (packet, client) => {
    if (client) {
      console.log(`📤 Message from ${client.id} to topic ${packet.topic}`);
      
      // Handle user activity messages
      if (packet.topic.startsWith('user-activity')) {
        try {
          // Delegate to user activity service for processing
          import('../user-activity').then(({ userActivityService }) => {
            userActivityService.processActivityEvent(packet.topic, packet.payload.toString());
          }).catch(error => {
            console.error('Failed to process user activity event:', error);
          });
        } catch (error) {
          console.error('Error handling user activity message:', error);
        }
      }
    }
  });

  aedesInstance.on("clientError", (client, err) => {
    console.error(`🔴 Client error ${client.id}:`, err.message);

    // Call custom handler
    if (handlers?.onClientError) {
      handlers.onClientError(client, err);
    }
  });

  // Memory monitoring (optional - can be removed if too verbose)
  const monitoringInterval = setInterval(() => {
    const used = process.memoryUsage();
    const heapUsedMB = (used.heapUsed / 1024 / 1024).toFixed(1);
    const rssMB = (used.rss / 1024 / 1024).toFixed(1);
    console.log(`💾 Memory: ${heapUsedMB}MB heap / ${rssMB}MB total | ` + `👥 Clients: ${aedesInstance.connectedClients}`);
  }, config.monitoringIntervalMs);

  // Cleanup function (to be called externally during shutdown)
  const cleanup = () => {
    clearInterval(monitoringInterval);
    aedesInstance.close(() => {
      console.log("🔴 MQTT Broker closed");
    });
    mqttServer.close();
    wss.close();
  };

  return { aedes: aedesInstance, mqttServer, wss, cleanup };
}

/**
 * Shutdown the MQTT broker
 * Call this during graceful shutdown
 */
export function shutdownMqttBroker(): void {
  if (aedesInstance) {
    aedesInstance.close(() => {
      console.log("🔴 MQTT Broker closed");
    });
  }
}

export function getAedes(): Aedes {
  if (!aedesInstance) {
    throw new Error("Aedes instance not initialized. Call createMqttBroker first.");
  }
  return aedesInstance;
}
