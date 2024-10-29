import { APIGatewayProxyEvent } from 'aws-lambda';
import { servicesReminder } from '../services-reminder';
import { filteredFixture } from '../__fixtures__/google-spreadsheet.fixture';
import { GenericError } from '../../../errors';
import { logger } from '../../../utils/logger';

const mockSendEmail = vi.hoisted(() => vi.fn());

vi.mock('../google-spreadsheet', () => ({
  getSpreadsheetData: () => filteredFixture,
}));

vi.mock('../../../lib/email', () => ({
  sendEmail: mockSendEmail,
}));

describe('Service reminder', () => {
  let proxy: APIGatewayProxyEvent;

  const context = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'test',
    functionVersion: 'test',
    invokedFunctionArn: 'test',
    memoryLimitInMB: 'test',
    awsRequestId: 'test',
    logGroupName: 'test',
    logStreamName: 'test',
    getRemainingTimeInMillis: () => 2,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.resetModules();
    vi.useRealTimers();
  });

  it('should add the context to the logger and log default messages', async () => {
    const contextSpy = vi.spyOn(logger, 'addContext');
    const debugSpy = vi.spyOn(logger, 'debug');

    await servicesReminder({ logger })(proxy, context);

    expect(contextSpy).toHaveBeenCalledWith(context);
    expect(debugSpy).toHaveBeenNthCalledWith(1, 'Starting check');
    expect(debugSpy).toHaveBeenLastCalledWith('Finished check');
  });

  it('should send an email for service to notify', async () => {
    vi.setSystemTime(new Date('2022-05-01'));
    const loggerSpy = vi.spyOn(logger, 'info');
    const result = await servicesReminder({ logger })(proxy, context);

    expect(loggerSpy).toHaveBeenLastCalledWith(
      'Sending email for Property: property 5 cert 5 15-May-2022',
    );
    expect(logger.info).toHaveBeenCalledTimes(4);
    expect(result).toMatchInlineSnapshot(`
      {
        "body": "{
        "message": "Ok"
      }",
        "statusCode": 200,
      }
    `);
    expect(mockSendEmail).toHaveBeenCalledTimes(4);

    expect(mockSendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        subject: 'cert 1 warranty expired for property 1 - please take action',
      }),
    );

    expect(mockSendEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        subject: 'cert 3 warranty expiring for property 3 - please take action',
      }),
    );
  });

  it('should not send an email if there are no services to notify', async () => {
    vi.setSystemTime(new Date('2023-01-01'));
    const loggerSpy = vi.spyOn(logger, 'info');
    const result = await servicesReminder({ logger })(proxy, context);
    expect(loggerSpy).toHaveBeenLastCalledWith('No emails to send');
    expect(result).toMatchInlineSnapshot(`
      {
        "body": "{
        "message": "No emails to send"
      }",
        "statusCode": 200,
      }
    `);
  });

  it('should throw an error if anything in the chain throws', async () => {
    vi.setSystemTime(new Date('2022-05-01'));
    vi.doMock('../google-spreadsheet', () => ({
      getSpreadsheetData: () => {
        throw new GenericError('Error');
      },
    }));

    const errorSpy = vi.spyOn(logger, 'error');
    const { servicesReminder: localServicesReminder } = await import('../services-reminder');

    const result = await localServicesReminder({ logger })(proxy, context);

    expect(result).toMatchInlineSnapshot(`
      {
        "body": "{
        "message": "Error"
      }",
        "statusCode": 500,
      }
    `);
    expect(errorSpy).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Error with property service warranty',
        html: expect.any(String),
      }),
    );
  });
});
