import type { MongoClient } from 'mongodb';
import type {
  INotification,
  INotificationOp,
  INotificationStatus,
} from './types';
import { ObjectId } from 'mongodb';
import {
  DATABASE_NAME,
  COLLECTION_NAME,
  NotificationStatus,
} from './constants';
import { log } from './utils';

// For classes that serve as interfaces (e.g. instance of Singleton)
export class NotificationSdk {
  client: MongoClient;
  constructor(client: MongoClient) {
    this.client = client;
  }

  async exists(externalId: string): Promise<INotificationStatus> {
    log('Checking for notification', 2);
    const database = this.client.db(DATABASE_NAME);
    const collection = database.collection(COLLECTION_NAME);
    const entry = await collection.findOne({
      externalId: new ObjectId(externalId),
    });
    if (!entry) throw new Error('Notification not found');
    log('Finished checking for notification', 0);
    return {
      success: true,
      status: entry?.status,
      id: entry?.externalId,
    };
  }

  async send(payload: INotification): Promise<INotificationOp> {
    log('Sending a notification', 2);
    const database = this.client.db(DATABASE_NAME);
    const notifications = database.collection(COLLECTION_NAME);
    const operation = await notifications.insertOne(payload);

    if (!operation.acknowledged) throw new Error('Operation failed');

    log('Finished sending a notification', 0);
    return {
      success: true,
      ...payload,
    };
  }

  async update(
    externalId: string,
    status: NotificationStatus
  ): Promise<INotificationStatus> {
    log('Updating a notification status', 2);
    const database = this.client.db(DATABASE_NAME);
    const notifications = database.collection(COLLECTION_NAME);
    const operation = await notifications.updateOne(
      { externalId: new ObjectId(externalId) },
      { $set: { status } }
    );

    if (!operation.acknowledged) throw new Error('Operation failed');
    log('The notification status was updated sucessfully', 0);
    return {
      success: true,
      status,
      id: new ObjectId(externalId),
    };
  }
}
