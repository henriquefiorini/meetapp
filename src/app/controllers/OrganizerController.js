import * as Yup from 'yup';

import Meetup from '../models/Meetup';

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
    });
    return res.json(meetups);
  }
}

export default new OrganizerController();
