const { differenceInHours, startOfToday } = require('date-fns');
const formatResponse = require('../../utils/format-response');
const sendEmail = require('../../lib/email');
const { getSuccessEmail, getErrorEmail } = require('./generate-email-template');
const googleSpreadsheet = require('./google-spreadsheet');

const HOURS_IN_DAY = 24;
const REMIND_IN_DAYS = [2, 7, 14];

function calculateIfDateExpiring({ linkToCertificate, property, expiryDate, certificateType }) {
  // Probably not the best idea using Date.parse given inconsistencies in
  // non-standard date strings but YOLO...
  const formattedExpiryDate = new Date(Date.parse(expiryDate));
  const expiringInDays = Math.floor(
    differenceInHours(formattedExpiryDate, startOfToday()) / HOURS_IN_DAY,
  );
  const hasExpired = expiringInDays === -1;

  if (hasExpired || REMIND_IN_DAYS.includes(expiringInDays)) {
    console.log(`Sending email for: ${property}`);

    return sendEmail(
      getSuccessEmail({
        linkToCertificate,
        property,
        expiryDate,
        certificateType,
        expiringInDays,
        hasExpired,
      }),
    );
  }
}

async function caclulateAllExpiringServices(items) {
  const promises = items.map((item) => calculateIfDateExpiring(item));

  if (!promises.filter(Boolean).length) {
    console.log('No emails to send');
  }

  return Promise.all(promises);
}

async function servicesReminder() {
  console.log('Starting services reminder');

  try {
    const data = await googleSpreadsheet.getData();

    await caclulateAllExpiringServices(data);

    return formatResponse(200, { message: 'Ok' });
  } catch (err) {
    console.log(err);

    sendEmail(getErrorEmail(err.stack));

    return formatResponse(500, err.toString());
  } finally {
    console.log('Finished services reminder');
  }
}

module.exports = servicesReminder;
