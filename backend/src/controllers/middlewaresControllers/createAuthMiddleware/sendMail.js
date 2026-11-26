const { passwordVerfication } = require('../../../emailTemplate/emailVerfication');
const { Resend } = require('resend');

const sendMail = async ({
  email,
  name,
  link,
  accessohub_app_email,
  subject = 'Verify your email | AccessoHub CRM',
  type = 'emailVerfication',
}) => {
  if (!process.env.RESEND_API) {
    return { skipped: true, reason: 'RESEND_API not configured' };
  }

  const resend = new Resend(process.env.RESEND_API);

  const { data } = await resend.emails.send({
    from: accessohub_app_email,
    to: email,
    subject,
    html: passwordVerfication({ name, link }),
  });

  return data;
};

module.exports = sendMail;
