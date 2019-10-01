import Mail from '../../lib/Mail';

class ForgotPasswordMail {
  get key() {
    return 'ForgotPasswordMail';
  }

  async handle({ data }) {
    const { user, url } = data;
    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: `Forgotten your password?`,
      template: 'forgot-password',
      context: { url },
    });
  }
}

export default new ForgotPasswordMail();
