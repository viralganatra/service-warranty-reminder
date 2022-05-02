import { differenceInHours, startOfToday } from 'date-fns';
import formatResponse from '../../utils/format-response';
import sendEmail from '../../lib/email';
import { getSuccessEmail, getErrorEmail } from './generate-email-template';
import googleSpreadsheet from './google-spreadsheet';
import { Property } from '../../types/data';

const HOURS_IN_DAY = 24;
const REMIND_IN_DAYS = [2, 7, 14];

function calculateIfDateExpiring({
  linkToCertificate,
  property,
  expiryDate,
  certificateType,
}: Property) {
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

async function caclulateAllExpiringServices(items: Property[]) {
  const promises = items.map((item) => calculateIfDateExpiring(item));

  if (!promises.filter(Boolean).length) {
    console.log('No emails to send');
  }

  return Promise.all(promises);
}

export default async function servicesReminder() {
  console.log('Starting services reminder');

  try {
    const data = await googleSpreadsheet();

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
