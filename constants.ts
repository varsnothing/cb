export enum Channel {
  sms = 'sms',
  whatsApp = 'whatsApp',
}

export enum NotificationStatus {
  processing = 'processing',
  rejected = 'rejected',
  sent = 'sent',
  delivered = 'delivered',
  viewed = 'viewed',
}

export const DATABASE_NAME = 'transactional';
export const COLLECTION_NAME = 'notifications';
