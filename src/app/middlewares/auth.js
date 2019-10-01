import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      error: 'Token not provided.',
    });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const { id } = await promisify(jwt.verify)(token, authConfig.secret);
    req.currentUserId = id;
    return next();
  } catch (err) {
    return res.status(401).json({
      error:
        err.name === 'TokenExpiredError'
          ? 'Provided token has expired.'
          : 'Invalid Token.',
    });
  }
};
