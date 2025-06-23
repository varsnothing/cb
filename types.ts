import type { MongoClient } from 'mongodb';
import type { Channel, NotificationStatus } from './constants';
import type { ObjectId } from 'mongodb';

export interface IMemo {
  success: boolean;
  message: string;
  status: number;
  data?: INotification | INotificationStatus | Record<string, unknown>;
}

export interface INotificationStatus {
  success: boolean;
  status: NotificationStatus;
  id: ObjectId;
}

export interface INotificationSdk {
  client: MongoClient;
  exists: () => unknown;
  send: () => void;
}

export interface INotification {
  id?: string;
  channel: Channel;
  to: string;
  body: string;
  externalId: ObjectId;
  status: NotificationStatus;
  queuedTime: string;
}

export interface INotificationOp extends INotification {
  success?: boolean;
}

export interface INotificationQueue {
  notifications: Notification[];
}
