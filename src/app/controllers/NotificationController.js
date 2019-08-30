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
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { readAt: new Date() },
      { new: true }
    );
    return res.json(notification);
  }
}

export default new NotificationController();
