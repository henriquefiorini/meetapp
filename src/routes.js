import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import MeetupController from './app/controllers/MeetupController';
import FileController from './app/controllers/FileController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.create);

routes.post('/users', UserController.create);
routes.put('/users', authMiddleware, UserController.update);

routes.post('/meetups', authMiddleware, MeetupController.create);
routes.put('/meetups/:id', authMiddleware, MeetupController.update);

routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.create
);

export default routes;
