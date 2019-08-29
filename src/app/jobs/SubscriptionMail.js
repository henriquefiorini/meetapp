import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { subscription } = data;
    await Mail.sendMail({
      to: `${subscription.meetup.organizer.name} <${subscription.meetup.organizer.email}>`,
      subject: `Nova inscrição em ${subscription.meetup.title}`,
      template: 'subscription',
      context: {
        meetup: subscription.meetup.title,
        date: subscription.meetup.date,
        organizer: subscription.meetup.organizer.name,
        participant: subscription.participant.name,
      },
    });
  }
}

export default new SubscriptionMail();
