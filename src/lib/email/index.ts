import * as SparkPostProvider from './sparkpost-provider';
import { SPARKPOST_PROVIDER } from '../../constants/email-providers';

export function sendEmail({ provider = SPARKPOST_PROVIDER, ...rest }) {
  let EmailProvider: typeof SparkPostProvider;

  switch (provider) {
    default:
      EmailProvider = SparkPostProvider;
  }

  return EmailProvider.sendEmail(rest);
}
