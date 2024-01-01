import SparkPost from 'sparkpost';
import * as SparkPostProvider from '../sparkpost-provider';

const sendMock = vi.fn();

vi.mock('sparkpost', () => ({
  default: vi.fn(() => ({
    transmissions: {
      send: sendMock,
    },
  })),
}));

vi.mock('../../../utils/ssm', () => ({
  getSSMParams: vi.fn(() => ({
    SparkPostApiKey: {
      Value: 'SparkPostApiKey',
    },
    SparkPostEmailListId: {
      Value: 'SparkPostEmailListId',
    },
    emailFromAddress: {
      Value: 'test@test.com',
    },
  })),
}));

describe('SparkPost email provider', () => {
  const defaults = {
    subject: 'subject',
    html: '<div>hello world</div>',
  };

  afterEach(() => {
    sendMock.mockReset();
  });

  it('should initialise the SparkPost provider with the correct configuration', async () => {
    await SparkPostProvider.sendEmail(defaults);

    expect(SparkPost).toHaveBeenCalledWith('SparkPostApiKey', {
      origin: 'https://api.eu.sparkpost.com:443',
    });
  });

  it('should send an email to a list of recipients', async () => {
    await SparkPostProvider.sendEmail(defaults);

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith({
      content: {
        from: 'Property Service Warranty <test@test.com>',
        html: '<div>hello world</div>',
        subject: 'subject',
      },
      options: { transactional: true },
      recipients: { list_id: 'SparkPostEmailListId' },
    });
  });
});
