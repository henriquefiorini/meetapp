import Mail from '../../lib/Mail';

class ResetPasswordMail {
  get key() {
    return 'ResetPasswordMail';
  }

  async handle({ data }) {
    const { user, url } = data;
    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: `Forgotten your password?`,
      template: 'reset-password',
      context: { url },
    });
  }
}

export default new ResetPasswordMail();
