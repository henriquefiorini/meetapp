import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';

import Meetup from '../models/Meetup';

class MeetupController {
  async list(req, res) {
    return res.json();
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

    // Validate if the date is in the past
    const startTime = startOfHour(parseISO(req.body.date));
    if (isBefore(startTime, new Date())) {
      return res.status(400).json({
        error: 'You must not use past dates.',
      });
    }

    // Update meetup
    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    return res.json();
  }
}

export default new MeetupController();
