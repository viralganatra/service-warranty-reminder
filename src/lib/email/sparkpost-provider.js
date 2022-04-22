const SparkPost = require('sparkpost');
const getSSMParams = require('../../utils/ssm');

async function sendEmail({ subject, to, html, from }) {
  const secrets = await getSSMParams(['SPARKPOST_API_KEY', 'EMAIL_FROM_ADDRESS']);

  const emailClient = new SparkPost(secrets.SPARKPOST_API_KEY.Value, {
    origin: 'https://api.eu.sparkpost.com:443',
  });

  return emailClient.transmissions.send({
    content: {
      subject,
      html,
      from: from || `Property Service Warranty <${secrets.EMAIL_FROM_ADDRESS.Value}>`,
    },
    options: {
      transactional: true,
    },
    recipients: to,
  });
}

exports.sendEmail = sendEmail;
