import Meetup from '../models/Meetup';

class OrganizerController {
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
