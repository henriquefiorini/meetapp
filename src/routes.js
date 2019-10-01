import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

import SessionController from './app/controllers/SessionController';
import ResetPasswordController from './app/controllers/ResetPasswordController';
import UserController from './app/controllers/UserController';
import MeetupController from './app/controllers/MeetupController';
import OrganizerController from './app/controllers/OrganizerController';
import SubscriptionController from './app/controllers/SubscriptionController';
import NotificationController from './app/controllers/NotificationController';
import FileController from './app/controllers/FileController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.create);

routes.post('/reset_password', ResetPasswordController.create);
routes.put('/reset_password', ResetPasswordController.update);

routes.post('/users', UserController.create);
routes.put('/users', authMiddleware, UserController.update);

routes.get('/meetups', authMiddleware, MeetupController.list);
routes.post('/meetups', authMiddleware, MeetupController.create);
routes.put('/meetups/:id', authMiddleware, MeetupController.update);
routes.delete('/meetups/:id', authMiddleware, MeetupController.delete);

routes.get('/meetups/organizing', authMiddleware, OrganizerController.list);

routes.get('/subscriptions', authMiddleware, SubscriptionController.list);
routes.post(
  '/meetups/:id/subscriptions',
  authMiddleware,
  SubscriptionController.create
);
routes.delete(
  '/subscriptions/:id',
  authMiddleware,
  SubscriptionController.delete
);

routes.get('/notifications', authMiddleware, NotificationController.list);
routes.put(
  '/notifications/:id/read',
  authMiddleware,
  NotificationController.update
);

routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.create
);

export default routes;
