import { Op } from 'sequelize';
import * as Yup from 'yup';

import Subscription from '../models/Subscription';
import User from '../models/User';
import Meetup from '../models/Meetup';

import Notification from '../schemas/Notification';

import Queue from '../../lib/Queue';

import SubscriptionMail from '../jobs/SubscriptionMail';
import UnsubscriptionMail from '../jobs/UnsubscriptionMail';

class SubscriptionController {
  async list(req, res) {
    // Get subscriptions ordered by date from current user
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.currentUserId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
        },
      ],
      order: [[{ model: Meetup, as: 'meetup' }, 'date']],
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
    const meetup = await Meetup.findByPk(req.params.id, {
      include: {
        model: User,
        as: 'organizer',
        attributes: ['name', 'email'],
        required: true,
      },
    });
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
          as: 'meetup',
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
      user_id: user.id,
      meetup_id: meetup.id,
    });

    // Send notification to the organizer
    await Notification.create({
      userId: meetup.organizer_id,
      type: 'SUBSCRIPTION.NEW',
      content: `${user.name} subscribed to ${meetup.title}.`,
      metadata: {
        meetupId: meetup.id,
        organizerId: meetup.organizer_id,
        participantId: user.id,
      },
    });

    // Send mail to the organizer
    await Queue.add(SubscriptionMail.key, {
      subscription: {
        meetup,
        participant: {
          name: user.name,
        },
      },
    });

    return res.json(subscription);
  }

  async delete(req, res) {
    // Validate request parameters
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });
    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({
        error: 'Invalid request.',
      });
    }

    // Retrieve requested subscription
    const subscription = await Subscription.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'participant',
          attributes: ['id', 'name'],
          required: true,
        },
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['id', 'title', 'date'],
          required: true,
          include: [
            {
              model: User,
              as: 'organizer',
              attributes: ['id', 'name', 'email'],
              required: true,
            },
          ],
        },
      ],
    });

    // Validate if the subscription exists
    if (!subscription) {
      return res.status(400).json({
        error: 'Record not found.',
      });
    }

    // Validate if the meetup has already happened
    if (subscription.meetup.has_passed) {
      return res.status(400).json({
        error: 'You cannot unsubscribe from past meetups.',
      });
    }

    // Cancel (delete) subscription
    await subscription.destroy();

    // Send notification to the organizer
    const { meetup, participant } = subscription;
    await Notification.create({
      userId: meetup.organizer.id,
      type: 'SUBSCRIPTION.CANCELED',
      content: `${participant.name} cancelled it's subscription on ${meetup.title}.`,
      metadata: {
        meetupId: meetup.id,
        organizerId: meetup.organizer.id,
        participantId: participant.id,
      },
    });

    // Send mail to organizer
    await Queue.add(UnsubscriptionMail.key, { subscription });

    return res.send();
  }
}

export default new SubscriptionController();
