/* eslint @typescript-eslint/no-unused-expressions:0 */
import type { IMemo } from './types';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import * as express from 'express';
import { NotificationSdk } from './interfaces';
import { NotificationStatus } from './constants';
import { log } from './utils';

const PORT = 3000;

const app = express();
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const notificationSdk = new NotificationSdk(client);

const memo: IMemo = {
  success: false,
  message: '',
  status: 500,
  data: {},
};

app.use(express.json());

app.get('/:notificationId', async (req, res) => {
  try {
    const notificationId = req?.params?.notificationId;
    const notification = await notificationSdk.exists(notificationId);

    if (!notification.success) throw new Error('Notification not found');

    const message = 'Notification found';
    memo.status = 200;
    memo.success = true;
    memo.message = message;
    memo.data = {};
    memo.data.id = notification.id;
    memo.data.status = notification.status;

    res.send(memo);
  } catch (e) {
    const message = `Error: ${e.message}`;
    memo.success = false;
    memo.status = 500;
    memo.message = message;
    log(message, 1);
    res.status(500).send(memo);
  } finally {
    ((memo.success = false), (memo.data = {}), (memo.status = 500));
  }
});

app.post('/', async (req, res) => {
  memo.data = {};
  try {
    const to = req?.body?.to;
    const body = req?.body?.body;
    const channel = req?.body?.channel;

    if (!to || !body || !channel) throw new Error('Missing notification data.');

    const payload = {
      to,
      body,
      channel,
      status: NotificationStatus.processing,
      externalId: new ObjectId(),
      queuedTime: new Date().toISOString(),
    };

    const notification = await notificationSdk.send(payload);

    const message = 'Notification inserted successfully';

    memo.status = 200;
    memo.success = true;
    memo.message = message;
    memo.data = notification;
    res.send(memo);
  } catch (e) {
    const message = `Error: ${e.message}`;
    memo.success = false;
    memo.status = 500;
    memo.message = message;
    log(message, 1);
    res.status(500).send(memo);
  } finally {
    ((memo.success = false), (memo.data = {}), (memo.status = 500));
  }
});

app.patch('/', async (req, res) => {
  try {
    const id = req?.body?.id;
    const status = req?.body?.status;

    if (!id) throw new Error('Missing notification identifier.');

    if (!Object.values(NotificationStatus).includes(status))
      throw new Error('Unsupported status');

    const notification = await notificationSdk.update(
      id,
      NotificationStatus[status]
    );

    const message = 'Notification status updated successfully';

    memo.status = 200;
    memo.success = true;
    memo.message = message;
    memo.data = {};
    memo.data.id = notification.id;
    memo.data.status = notification.status;
    res.send(memo);
  } catch (e) {
    const message = `Error: ${e.message}`;
    memo.success = false;
    memo.status = 500;
    memo.message = message;
    log(message, 1);
    res.status(500).send(memo);
  } finally {
    ((memo.success = false), (memo.data = {}), (memo.status = 500));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
