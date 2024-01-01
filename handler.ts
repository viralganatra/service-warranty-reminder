import { logger } from './src/utils/logger';
import { servicesReminder as handleServicesReminder } from './src/functions/services-reminder';

export const servicesReminder = handleServicesReminder({ logger });
