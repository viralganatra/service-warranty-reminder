import { differenceInHours, startOfToday } from 'date-fns';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { getSuccessEmail, getErrorEmail } from './generate-email-template';
import { getSpreadsheetData } from './google-spreadsheet';
import { sendEmail } from '../../lib/email';
import { formatResponse } from '../../utils/format-response';
import { Service, ServiceWithExpiration } from '../../schemas/data.schema';

const HOURS_IN_DAY = 24;
const REMIND_IN_DAYS = [2, 7, 14];

function getServiceToNotify(service: Service): ServiceWithExpiration | null {
  const expiringInDays = Math.floor(
    differenceInHours(service.expiryDate, startOfToday()) / HOURS_IN_DAY,
  );
  const hasExpired = expiringInDays === -1;

  if (hasExpired || REMIND_IN_DAYS.includes(expiringInDays)) {
    return { ...service, expiringInDays, hasExpired };
  }

  return null;
}

async function getAllServicesToNotify(services: Service[]) {
  return services.map((service) => getServiceToNotify(service)).filter(Boolean);
}

async function notifyAllExpiringServices(
  services: ServiceWithExpiration[],
  { logger }: { logger: Logger },
) {
  const promises = services.map((service) => {
    logger.info(
      `Sending email for Property: ${service.property} ${service.certificateType} ${service.expiryDate}`,
    );

    return sendEmail(getSuccessEmail(service));
  });

  return Promise.all(promises);
}

export const servicesReminder =
  ({ logger }: { logger: Logger }) =>
  async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    logger.addContext(context);
    logger.debug('Starting check');

    try {
      const data = await getSpreadsheetData();
      const servicesToNotify = await getAllServicesToNotify(data);

      if (!servicesToNotify.length) {
        logger.info('No emails to send');
        return formatResponse(200, { message: 'No emails to send' });
      }

      await notifyAllExpiringServices(servicesToNotify, { logger });

      return formatResponse(200, { message: 'Ok' });
    } catch (err) {
      let message;

      if (err instanceof Error) {
        const error = err.toString();

        message = err.message;

        logger.error(error, err);

        await sendEmail(getErrorEmail(err.stack || error));
      } else {
        message = String(err);
      }

      return formatResponse(500, { message });
    } finally {
      logger.debug('Finished check');
    }
  };
