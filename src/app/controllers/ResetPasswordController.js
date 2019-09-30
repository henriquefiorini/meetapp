import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import authConfig from '../../config/auth';

import User from '../models/User';

import Queue from '../../lib/Queue';

import ResetPasswordMail from '../jobs/ResetPasswordMail';

class ResetPasswordController {
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
        expiresIn: '2h',
      });
      const url = `${process.env.CLIENT_URL}/reset-password/${token}`;

      // Send mail with reset link
      await Queue.add(ResetPasswordMail.key, { user, url });

      return res.send();
    } catch (err) {
      return res.status(500).json({
        error: 'Interval server error',
      });
    }
  }
}

export default new ResetPasswordController();
