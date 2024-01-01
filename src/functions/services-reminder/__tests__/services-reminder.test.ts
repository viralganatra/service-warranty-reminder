import { Logger } from '@aws-lambda-powertools/logger';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { Mock } from 'vitest';
import { servicesReminder } from '../services-reminder';
import { filteredFixture } from '../__fixtures__/google-spreadsheet.fixture';
import { sendEmail } from '../../../lib/email';
import { GenericError } from '../../../errors';

vi.mock('../google-spreadsheet', () => ({
  getSpreadsheetData: () => filteredFixture,
}));

vi.mock('../../../lib/email', () => ({
  sendEmail: vi.fn(),
}));

describe('Service reminder', () => {
  let logger: Logger;
  let proxy: APIGatewayProxyEvent;
  let context: Context;

  beforeEach(() => {
    vi.useFakeTimers();

    logger = new (vi.fn())();
    proxy = new (vi.fn())();
    context = new (vi.fn())();

    logger.addContext = vi.fn();
    logger.debug = vi.fn();
    logger.info = vi.fn();
    logger.error = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.useRealTimers();
  });

  it('should add the context to the logger and log default messages', async () => {
    await servicesReminder({ logger })(proxy, context);

    expect((logger.addContext as Mock).mock.calls[0][0]).toBe(context);
    expect(logger.debug).toHaveBeenNthCalledWith(1, 'Starting check');
    expect(logger.debug).toHaveBeenLastCalledWith('Finished check');
  });

  it('should send an email for service to notify', async () => {
    vi.setSystemTime(new Date('2022-05-01'));
    const mockSendEmail = sendEmail as Mock;
    const result = await servicesReminder({ logger })(proxy, context);

    expect(logger.info).toHaveBeenLastCalledWith(
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
    expect(mockSendEmail.mock.calls[0][0]).toMatchSnapshot();
    expect(mockSendEmail.mock.calls[1][0]).toMatchSnapshot();
  });

  it('should not send an email if there are no services to notify', async () => {
    vi.setSystemTime(new Date('2023-01-01'));
    const result = await servicesReminder({ logger })(proxy, context);
    expect(logger.info).toHaveBeenLastCalledWith('No emails to send');
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
    expect(logger.error).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Error with property service warranty',
        html: expect.any(String),
      }),
    );
  });
});
