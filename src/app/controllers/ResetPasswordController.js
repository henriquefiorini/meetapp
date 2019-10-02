import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import authConfig from '../../config/auth';

import Token from '../models/Token';
import User from '../models/User';

class ResetPasswordController {
  async create(req, res) {
    const schema = Yup.object().shape({
      token: Yup.string().required(),
      password: Yup.string()
        .min(6)
        .required(),
      passwordConfirmation: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Invalid request.',
      });
    }

    // Find and validate token
    const token = await Token.findOne({ where: { token: req.body.token } });
    if (!token || token.is_revoked || token.is_expired || token.is_used) {
      return res.status(400).json({
        error: 'Invalid token',
      });
    }

    // Find user
    const user = await User.findByPk(token.user_id);

    // Update password
    const { id, name, email } = await user.update({
      password: req.body.password,
    });

    // Invalidate token after use
    await token.update({ used_at: new Date() });

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
