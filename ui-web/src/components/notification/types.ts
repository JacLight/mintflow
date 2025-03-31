export interface SiteNotificationModel {
  title?: string;
  message: string;
  status?: SiteNotificationStatus;
  type: SiteNotificationType;
  icon?: any;
  delay?: number;
  closeFn?: { caption: String; fn?: (any) => any };
  okFn?: { caption: String; fn?: (any) => any };
  buttons?: { caption: string; fn: (any) => any }[];
}

export enum SiteNotificationStatus {
  New = 'New',
  Shown = 'Shown',
  Seen = 'Seen',
  Confirmed = 'Confirmed',
  Expired = 'Expired',
}

export enum SiteNotificationType {
  Success = 'success',
  Warning = 'warning',
  Info = 'info',
  Error = 'error',
}
