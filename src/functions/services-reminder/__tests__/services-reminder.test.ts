import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import servicesReminder from '../services-reminder';
import { filteredFixture } from '../__fixtures__/google-spreadsheet';
import sendEmail from '../../../lib/email';

jest.mock('../google-spreadsheet', () => () => filteredFixture);
jest.mock('../../../lib/email', () => jest.fn());

describe('Service reminder', () => {
  let logger: Logger;
  let proxy: APIGatewayProxyEvent;
  let context: Context;

  beforeEach(() => {
    jest.useFakeTimers();

    logger = new (jest.fn())();
    proxy = new (jest.fn())();
    context = new (jest.fn())();

    logger.addContext = jest.fn();
    logger.debug = jest.fn();
    logger.info = jest.fn();
    logger.error = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    jest.useRealTimers();
  });

  it('should add the context to the logger and log default messages', async () => {
    await servicesReminder({ logger })(proxy, context);

    expect((logger.addContext as jest.Mock).mock.calls[0][0]).toBe(context);
    expect(logger.debug).nthCalledWith(1, 'Starting check');
    expect(logger.debug).lastCalledWith('Finished check');
  });

  it('should send an email for service to notify', async () => {
    jest.setSystemTime(new Date('2022-05-01'));

    const mockSendEmail = sendEmail as jest.Mock;
    const result = await servicesReminder({ logger })(proxy, context);

    expect(logger.info).lastCalledWith('Sending email for Property: property 5 cert 5 15-May-2022');
    expect(logger.info).toBeCalledTimes(4);
    expect(result).toMatchInlineSnapshot(`
      Object {
        "body": "{
        \\"message\\": \\"Ok\\"
      }",
        "statusCode": 200,
      }
    `);

    expect(mockSendEmail).toBeCalledTimes(4);
    expect(mockSendEmail.mock.calls[0][0]).toMatchSnapshot();
    expect(mockSendEmail.mock.calls[1][0]).toMatchSnapshot();
  });

  it('should not send an email if there are no services to notify', async () => {
    jest.setSystemTime(new Date('2023-01-01'));

    const result = await servicesReminder({ logger })(proxy, context);

    expect(logger.info).lastCalledWith('No emails to send');
    expect(result).toMatchInlineSnapshot(`
      Object {
        "body": "{
        \\"message\\": \\"No emails to send\\"
      }",
        "statusCode": 200,
      }
    `);
  });

  it('should throw an error if the data schema is invalid', async () => {
    jest.doMock('../google-spreadsheet', () => ({
      __esModule: true,
      default: () => [{ property: 'prop 1' }],
    }));

    const mockSendEmail = jest.fn();

    jest.doMock('../../../lib/email', () => ({
      __esModule: true,
      default: mockSendEmail,
    }));

    const localServicesReminder = await import('../services-reminder');
    const result = await localServicesReminder.default({ logger })(proxy, context);

    expect(result).toEqual({
      statusCode: 500,
      body: '"InvalidSchemaError: ValidationError: [0].linkToCertificate is a required field"',
    });

    expect(logger.error).toBeCalled();
    expect(mockSendEmail).toBeCalledWith(
      expect.objectContaining({
        subject: 'Error with property service warranty',
        html: expect.any(String),
      }),
    );
  });
});
