import SparkPost from 'sparkpost';
import getSSMParams from '../../utils/ssm';

export async function sendEmail({ subject, html, from }: SparkPost.InlineContent) {
  const secrets = await getSSMParams([
    'SparkPostApiKey',
    'SparkPostEmailListId',
    'emailFromAddress',
  ]);

  const emailClient = new SparkPost(secrets.SparkPostApiKey?.Value, {
    origin: 'https://api.eu.sparkpost.com:443',
  });

  return emailClient.transmissions.send({
    content: {
      subject,
      html,
      from: from || `Property Service Warranty <${secrets.emailFromAddress?.Value}>`,
    },
    options: {
      transactional: true,
    },
    recipients: {
      list_id: secrets.SparkPostEmailListId?.Value,
    },
  });
}
