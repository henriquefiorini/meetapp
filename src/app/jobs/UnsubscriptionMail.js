import Mail from '../../lib/Mail';

class UnsubscriptionMail {
  get key() {
    return 'UnsubscriptionMail';
  }

  async handle({ data }) {
    const { subscription } = data;
    await Mail.sendMail({
      to: `${subscription.meetup.organizer.name} <${subscription.meetup.organizer.email}>`,
      subject: `New cancellation in ${subscription.meetup.title}`,
      template: 'unsubscription',
      context: {
        meetup: subscription.meetup.title,
        date: subscription.meetup.date,
        organizer: subscription.meetup.organizer.name,
        participant: subscription.participant.name,
      },
    });
  }
}

export default new UnsubscriptionMail();
