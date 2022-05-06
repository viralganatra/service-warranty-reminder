import logger from './src/utils/logger';
import handleServicesReminder from './src/functions/services-reminder';

export const servicesReminder = handleServicesReminder({ logger });
