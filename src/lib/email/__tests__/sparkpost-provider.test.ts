import SparkPost from 'sparkpost';
import * as SparkPostProvider from '../sparkpost-provider';

const sendMock = jest.fn();

jest.mock('../../../utils/ssm');

jest.mock('sparkpost', () =>
  jest.fn(() => ({
    transmissions: {
      send: sendMock,
    },
  })),
);

describe('SparkPost email provider', () => {
  const defaults = {
    subject: 'subject',
    html: '<div>hello world</div>',
  };

  afterEach(() => sendMock.mockReset());

  it('should initialise the SparkPost provider with the correct configuration', async () => {
    const mockSparkPost = SparkPost as jest.Mock;

    await SparkPostProvider.sendEmail(defaults);

    expect(mockSparkPost).toBeCalledWith('SparkPostApiKey', {
      origin: 'https://api.eu.sparkpost.com:443',
    });
  });

  it('should send an email to a list of recipients', async () => {
    await SparkPostProvider.sendEmail(defaults);

    expect(sendMock).toBeCalledTimes(1);
    expect(sendMock).toBeCalledWith({
      content: {
        from: 'Property Service Warranty <emailFromAddress>',
        html: '<div>hello world</div>',
        subject: 'subject',
      },
      options: { transactional: true },
      recipients: { list_id: 'SparkPostEmailListId' },
    });
  });
});
