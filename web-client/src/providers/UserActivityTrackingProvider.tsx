import React from "react";
import { useAppState } from "../hooks/useAppState";
import { UserActivityProvider } from "../providers/UserActivityProvider";
import { useUserActivitySync } from "../hooks/useUserActivitySync";
import UserActivitySync from "@/components/UserActivitySync";
import UserActivityWrapper from "@/components/UserActivityWrapper";

interface UserActivityTrackingProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that sets up user activity tracking with automatic sync to device manager
 */
export function UserActivityTrackingProvider({
  children,
}: UserActivityTrackingProviderProps) {
  const { userId } = useAppState();

  if (!userId) {
    console.warn(
      "UserActivityTrackingProvider: No userId available from app state. User activity tracking will be disabled.",
    );
    return null;
  }

  return (
    <UserActivityProvider
      userId={userId}
      enableBatching={false} // Send immediately via HTTP
      batchSize={1}
    >
      <UserActivityWrapper>{children}</UserActivityWrapper>
    </UserActivityProvider>
  );
}

export default UserActivityTrackingProvider;
