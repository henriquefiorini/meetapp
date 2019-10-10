import * as Yup from 'yup';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class OrganizerController {
  async retrieve(req, res) {
    // Validate request query
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });
    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({
        error: 'Invalid request.',
      });
    }

    // Retrieve meetup
    const meetup = await Meetup.findByPk(req.params.id, {
      where: {
        organizer_id: req.currentUserId,
      },
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    if (!meetup) {
      return res.status(400).json({
        error: 'Record not found.',
      });
    }
    return res.json(meetup);
  }

  async list(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        organizer_id: req.currentUserId,
      },
      order: ['date'],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    return res.json(meetups);
  }
}

export default new OrganizerController();
