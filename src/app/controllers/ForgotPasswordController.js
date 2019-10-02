import * as Yup from 'yup';
import { randomBytes } from 'crypto';
import { hash } from 'bcryptjs';
import { parseISO, addHours } from 'date-fns';
import { promisify } from 'util';

import User from '../models/User';
import Token from '../models/Token';

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
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.send();
    }

    try {
      // Generate token
      const randomValue = await promisify(randomBytes)(16);
      const token = await hash(randomValue.toString('hex'), 8);

      // Save token
      await Token.create({
        user_id: user.id,
        token,
        expires_in: addHours(new Date(), 1),
      });

      // Create Reset Password URL
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
