import React from 'react';
import { useUser } from '../providers/UserProvider';
import { UserActivityProvider } from '../providers/UserActivityProvider';

interface UserActivityTrackingProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that sets up user activity tracking with automatic sync to device manager
 */
export function UserActivityTrackingProvider({ children }: UserActivityTrackingProviderProps) {
  const { userId } = useUser();

  if (!userId) {
    // Don't track activity until user is loaded
    return <>{children}</>;
  }

  return (
    <UserActivityProvider
      userId={userId}
      enableBatching={true}
      batchSize={10}
    >
      {children}
    </UserActivityProvider>
  );
}

export default UserActivityTrackingProvider;