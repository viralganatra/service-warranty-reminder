/// <reference path="./.sst/platform/config.d.ts" />

const SERVICE_NAME = 'service-warranty-reminder';
const AWS_REGION = 'eu-west-2';

export default $config({
  app(input) {
    return {
      name: SERVICE_NAME,
      removal: 'remove',
      home: 'aws',
      providers: {
        aws: {
          region: AWS_REGION,
          profile: input.stage === 'production' ? 'swr-production' : 'swr-dev',
        },
      },
    };
  },
  async run() {
    const ssmPath = $app.stage === 'production' ? `/prod/${SERVICE_NAME}` : `/dev/${SERVICE_NAME}`;
    const current = await aws.getCallerIdentity();

    new sst.aws.Cron('swrcron', {
      schedule: 'cron(0 10 * * ? *)',
      job: {
        handler: 'handler.servicesReminder',
        name: `${$app.stage}--${SERVICE_NAME}`,
        runtime: 'nodejs20.x',
        environment: {
          SERVICE_NAME,
          SSM_PATH: ssmPath,
        },
        logging: {
          format: 'json',
        },
        permissions: [
          {
            actions: ['ssm:GetParameters'],
            resources: [`arn:aws:ssm:${AWS_REGION}:${current.accountId}:parameter${ssmPath}/*`],
          },
        ],
      },
    });
  },
});
