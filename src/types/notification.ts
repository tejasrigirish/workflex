export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'application_accepted' | 'application_received' | 'job_completed' | 'new_job' | 'system';
  linkTarget?: string;
}
