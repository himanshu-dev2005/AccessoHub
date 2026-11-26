const mongoose = require('mongoose');
const { Resend } = require('resend');
const { loadSettings } = require('@/middlewares/settings');
const { useAppSettings } = require('@/settings');

const createMailHandler = ({ modelName, label, templateBuilder }) => {
  return async (req, res) => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        result: null,
        message: `${label} id is required`,
      });
    }

    const Model = mongoose.model(modelName);
    const result = await Model.findOne({ _id: id, removed: false }).exec();
    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: `${label} not found`,
      });
    }

    if (!process.env.RESEND_API) {
      return res.status(200).json({
        success: true,
        result: null,
        message: 'Email delivery is ready once RESEND_API is configured in backend .env',
      });
    }

    const recipientEmail = result.client?.email;
    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Client does not have an email address',
      });
    }

    const settings = await loadSettings();
    const appDefaults = useAppSettings();
    const fromEmail =
      settings['accessohub_app_email'] ||
      settings['idurar_app_email'] ||
      appDefaults['accessohub_app_email'];

    const docRef = result.year ? `#${result.number}/${result.year}` : `#${result.number}`;
    const subject = `${label} ${docRef} from AccessoHub`;

    const resend = new Resend(process.env.RESEND_API);
    const { data } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject,
      html: templateBuilder({
        title: `${label} ${docRef}`,
        name: result.client?.name || '',
      }),
    });

    return res.status(200).json({
      success: true,
      result: data,
      message: `${label} email sent successfully`,
    });
  };
};

module.exports = createMailHandler;
