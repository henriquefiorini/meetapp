import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

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
      await Queue.add(ResetPasswordMail.key, { user, url });

      return res.send();
    } catch (err) {
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      token: Yup.string().required(),
      password: Yup.string()
        .min(6)
        .required(),
      confirmPassword: Yup.required().oneOf([Yup.ref('password')]),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Invalid request.',
      });
    }

    // Get request body attributes
    const { token, password } = req.body;

    // Decode token
    const { id } = await promisify(jwt.verify)(token, authConfig.secret);

    // Validate if the user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(400).json({
        error: 'Record not found.',
      });
    }

    // Update password
    const { name, email } = await user.update({ password });

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new ResetPasswordController();
