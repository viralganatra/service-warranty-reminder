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

    $transform(sst.aws.Function, (args) => {
      args.runtime = 'nodejs22.x';
      args.url ??= $dev ? { authorization: 'iam' } : false;
      args.logging = {
        format: 'json',
        retention: '1 year',
        ...args.logging,
      };
      args.environment = {
        POWERTOOLS_DEV: String($dev),
        ...args.environment,
      };
    });

    new sst.aws.Cron('swrcron', {
      schedule: 'cron(0 10 * * ? *)',
      job: {
        handler: 'handler.servicesReminder',
        name: `${$app.stage}--${SERVICE_NAME}`,
        environment: {
          SERVICE_NAME,
          SSM_PATH: ssmPath,
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
