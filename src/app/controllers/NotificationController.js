import Notification from '../schemas/Notification';

class NotificationController {
  async list(req, res) {
    const notifications = await Notification.find({
      userId: req.currentUserId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);
    return res.json(notifications);
  }

  async update(req, res) {
    return res.json();
  }
}

export default new NotificationController();
