const template = require('../../utils/email-template');

function getSuccessTemplate({
  linkToCertificate,
  property,
  expiryDate,
  certificateType,
  expiringInDays,
  hasExpired,
}) {
  return template(`
    ${
      hasExpired
        ? `
      <h1>Warranty Expired!</h1>
      <p>The ${certificateType} warranty for ${property} expired on ${expiryDate}.</p>
    `
        : `
      <h1>Warranty Expiring!</h1>
      <p>The ${certificateType} warranty for ${property} is expiring on ${expiryDate} (in ${expiringInDays} days time).</p>
    `
    }
    <p>Please take action.</p>
    <hr />
    <h2>What to do</h2>
    <p>You can <a href="${linkToCertificate}">view the current certificate</a></p>

    <p>
      Please contact the relevant party to renew the warranty or ignore this message if you do not wish to take action.
    </p>
  `);
}

function getErrorTemplate(data) {
  return template(`
    <h1>Something went wrong with property service warranty</h1>
    <p>Please check the logs for errors</p>
    <p>${JSON.stringify(data, null, 2)}</p>
  `);
}

function getSubjectLine({ certificateType, property, hasExpired }) {
  const expiredStr = hasExpired ? 'expired' : 'expiring';

  return `${certificateType} warranty ${expiredStr} for ${property} - please take action`;
}

exports.getSuccessEmail = function getSuccessEmail(data) {
  return {
    subject: getSubjectLine(data),
    html: getSuccessTemplate(data),
  };
};

exports.getErrorEmail = function getErrorEmail(data) {
  return {
    subject: 'Error with property service warranty',
    html: getErrorTemplate(data),
  };
};
