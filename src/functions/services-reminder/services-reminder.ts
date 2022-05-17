import { differenceInHours, startOfToday } from 'date-fns';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { array, object, string } from 'yup';
import { getSuccessEmail, getErrorEmail } from './generate-email-template';
import googleSpreadsheet from './google-spreadsheet';
import sendEmail from '../../lib/email';
import formatResponse from '../../utils/format-response';
import validateSchema from '../../utils/validate-schema';
import { Service, ServiceWithExpiration } from '../../types/data';

const HOURS_IN_DAY = 24;
const REMIND_IN_DAYS = [2, 7, 14];

const dataSchema = array(
  object({
    property: string().required(),
    certificateType: string().required(),
    expiryDate: string().required(),
    linkToCertificate: string().required(),
  }),
).required();

function getServiceToNotify(service: Service): ServiceWithExpiration | null {
  // Probably not the best idea using Date.parse given inconsistencies in
  // non-standard date strings but YOLO...
  const formattedExpiryDate = new Date(Date.parse(service.expiryDate));
  const expiringInDays = Math.floor(
    differenceInHours(formattedExpiryDate, startOfToday()) / HOURS_IN_DAY,
  );
  const hasExpired = expiringInDays === -1;

  if (hasExpired || REMIND_IN_DAYS.includes(expiringInDays)) {
    return { ...service, expiringInDays, hasExpired };
  }

  return null;
}

async function getAllServicesToNotify(services: Service[]) {
  await validateSchema(dataSchema.validate(services));

  return services
    .map((service) => getServiceToNotify(service))
    .filter(Boolean) as ServiceWithExpiration[];
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

const servicesReminder =
  ({ logger }: { logger: Logger }) =>
  async (event: APIGatewayProxyEvent, context: Context) => {
    logger.addContext(context);
    logger.debug('Starting check');

    try {
      const data = await googleSpreadsheet();
      const servicesToNotify = await getAllServicesToNotify(data);

      if (!servicesToNotify.length) {
        logger.info('No emails to send');
        return formatResponse(200, { message: 'No emails to send' });
      }

      await notifyAllExpiringServices(servicesToNotify, { logger });

      return formatResponse(200, { message: 'Ok' });
    } catch (err) {
      logger.error(err.toString(), err as Error);

      await sendEmail(getErrorEmail(err.stack));

      return formatResponse(500, err.toString());
    } finally {
      logger.debug('Finished check');
    }
  };

export default servicesReminder;
