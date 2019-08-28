import { Op } from 'sequelize';
import * as Yup from 'yup';

import Subscription from '../models/Subscription';
import User from '../models/User';
import Meetup from '../models/Meetup';

class SubscriptionController {
  async list(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.currentUserId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
        },
      ],
      order: [[Meetup, 'date']],
    });
    return res.json(subscriptions);
  }

  async create(req, res) {
    // Validate request parameters
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });
    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({
        error: 'Invalid request.',
      });
    }

    // Validate if the user and the meetup exists
    const user = await User.findByPk(req.currentUserId);
    const meetup = await Meetup.findByPk(req.params.id);
    if (!user || !meetup) {
      return res.status(400).json({
        error: 'Record not found.',
      });
    }

    // Validate if the current user is not the organizer
    if (meetup.organizer_id === req.currentUserId) {
      return res.status(400).json({
        error: 'You cannot subscribe to meetups that you are organizing.',
      });
    }

    // Validate if the meetup already happened
    if (meetup.has_passed) {
      return res.status(400).json({
        error: 'You cannot subscribe to past meetups.',
      });
    }

    // Validate if the user is subscribed to this meetup or
    // if the meetup date conflicts with another subscription
    const hasConflictingSubscription = await Subscription.findOne({
      where: {
        user_id: req.currentUserId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });
    if (hasConflictingSubscription) {
      return res.status(400).json({
        error: 'You cannot subscribe to more than one meetup at the same time.',
      });
    }

    // Create subscription
    const subscription = await Subscription.create({
      user_id: req.currentUserId,
      meetup_id: req.params.id,
    });

    // Send mail to organizer

    return res.json(subscription);
  }

  async delete(req, res) {
    return res.json();
  }
}

export default new SubscriptionController();
