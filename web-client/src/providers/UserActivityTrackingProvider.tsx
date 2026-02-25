import React from "react";
import { useUser } from "../providers/UserProvider";
import { UserActivityProvider } from "../providers/UserActivityProvider";

interface UserActivityTrackingProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that sets up user activity tracking with automatic sync to device manager
 */
export function UserActivityTrackingProvider({
  children,
}: UserActivityTrackingProviderProps) {
  const { userId } = useUser();

  if (!userId) {
    console.warn(
      "UserActivityTrackingProvider: No user ID found, user activity will not be tracked.",
    );
    return <>{children}</>;
  }

  return (
    <UserActivityProvider userId={userId} enableBatching={true} batchSize={10}>
      {children}
    </UserActivityProvider>
  );
}

export default UserActivityTrackingProvider;
