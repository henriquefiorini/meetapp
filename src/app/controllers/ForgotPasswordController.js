import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import authConfig from '../../config/auth';

import User from '../models/User';

import Queue from '../../lib/Queue';

import ForgotPasswordMail from '../jobs/ForgotPasswordMail';

class ForgotPasswordController {
  async create(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Invalid request.',
      });
    }

    // For security reasons, do not return an error
    // if the user doesn't exists.
    const { email } = req.body;
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      return res.send();
    }

    try {
      // Create Reset Password URL
      const { id } = user;
      const token = jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });
      const url = `${process.env.CLIENT_URL}/reset_password/${token}`;

      // Send mail with reset link
      await Queue.add(ForgotPasswordMail.key, { user, url });

      return res.send();
    } catch (err) {
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}

export default new ForgotPasswordController();
