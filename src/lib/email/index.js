const SparkPostProvider = require('./sparkpost-provider');
const { SPARKPOST_PROVIDER } = require('../../constants/email-providers');

function sendEmail({ provider = SPARKPOST_PROVIDER, ...rest } = {}) {
  let Provider;

  switch (provider) {
    case SPARKPOST_PROVIDER:
    default:
      Provider = SparkPostProvider;
  }

  return Provider.sendEmail(rest);
}

module.exports = sendEmail;
