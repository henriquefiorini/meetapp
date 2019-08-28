import { Op } from 'sequelize';
import * as Yup from 'yup';
import {
  parseISO,
  startOfHour,
  startOfDay,
  endOfDay,
  isBefore,
} from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async list(req, res) {
    // Validate request query
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      page: Yup.number(),
    });
    if (!(await schema.isValid(req.query))) {
      return res.status(400).json({
        error: 'Invalid request.',
      });
    }

    // Destructure query parameters
    const { date, page = 1 } = req.query;

    // Parse date string to ISO Date object
    const parsedDate = parseISO(date);

    // Retrieve all meetups filtered by the date
    const meetups = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      attributes: ['id', 'title', 'description', 'location', 'date'],
      order: ['date'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['name'],
        },
      ],
    });

    return res.json(meetups);
  }

  async create(req, res) {
    // Validate request body
    const schema = Yup.object().shape({
      banner_id: Yup.number().required(),
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Invalid request.',
      });
    }

    // Destructure request parameters
    const { banner_id, title, description, location, date } = req.body;

    // Validate if the date is in the past
    const startTime = startOfHour(parseISO(date));
    if (isBefore(startTime, new Date())) {
      return res.status(400).json({
        error: 'You must not use past dates.',
      });
    }

    // Create meetup
    const meetup = await Meetup.create({
      organizer_id: req.currentUserId,
      banner_id,
      title,
      description,
      location,
      date,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    // Validate request body
    const schema = Yup.object().shape({
      banner_id: Yup.number(),
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Invalid request.',
      });
    }

    // Retrieve requested meetup
    const meetup = await Meetup.findByPk(req.params.id);

    // Validate if the meetup exists
    if (!meetup) {
      return res.status(400).json({
        error: 'Invalid request.',
      });
    }

    // Validate if the current user is the meetup organizer
    if (meetup.organizer_id !== req.currentUserId) {
      return res.status(401).json({
        error: 'You are not allowed to view this resource.',
      });
    }

    // Validate if the meetup has already happened
    if (meetup.has_passed) {
      return res.status(400).json({
        error: 'You cannot update past meetups.',
      });
    }

    // Destructure request parameters
    const { banner_id, title, description, location, date } = req.body;

    // Validate if the date is in the past
    const startTime = startOfHour(parseISO(date));
    if (isBefore(startTime, new Date())) {
      return res.status(400).json({
        error: 'You must not use past dates.',
      });
    }

    // Update meetup
    await meetup.update({
      banner_id,
      title,
      description,
      location,
      date,
    });

    return res.json(meetup);
  }

  async delete(req, res) {
    // Validate request query
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });
    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({
        error: 'Invalid request.',
      });
    }

    // Retrieve requested meetup
    const meetup = await Meetup.findByPk(req.params.id);

    // Validate if the meetup exists
    if (!meetup) {
      return res.status(400).json({
        error: 'Record not found.',
      });
    }

    // Validate if the current user is the meetup organizer
    if (meetup.organizer_id !== req.currentUserId) {
      return res.status(401).json({
        error: 'You are not allowed to view this resource.',
      });
    }

    // Validate if the meetup has already happened
    if (meetup.has_passed) {
      return res.status(400).json({
        error: 'You cannot delete past meetups.',
      });
    }

    // Delete meetup
    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
