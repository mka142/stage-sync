import { UserService } from "./user";

import type { MqttBrokerHandlers } from "@/modules/connections/broker";

export const mqttHandlers: MqttBrokerHandlers = {
  onClientConnect: (client) => {
    // Custom logic when a new client connects (excluding server publisher)
    console.log(`🎯 Custom handler: New device connected - ${client.id}`);
    // Get update user activity timestamp
    UserService.updateUserStatus(client.id, true);
  },

  onClientDisconnect: (client) => {
    // Custom logic when a client disconnects
    console.log(`👋 Custom handler: Device disconnected - ${client.id}`);
    UserService.updateUserStatus(client.id, false);
  },

  onClientError: (client, error) => {
    // Custom logic when a client encounters an error
    console.log(`⚠️ Custom handler: Client ${client.id} error - ${error.message}`);

    UserService.updateUserStatus(client.id, false);

    // Example: Log to monitoring system, send alerts, etc.
    // await logErrorToMonitoring(client.id, error);
  },

  onPublish: (packet, client) => {
    // Handle other message types here (user-activity now uses HTTP POST)
    console.log(`📤 Message published to topic: ${packet.topic}`);
  },
};
