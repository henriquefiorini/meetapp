import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';

const routes = new Router();

routes.post('/sessions', SessionController.create);

routes.post('/users', UserController.create);
routes.put('/users', authMiddleware, UserController.update);

export default routes;
