import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import SSM from '../ssm';

const getSecretPath = (secret: string) => `${process.env.SSM_PATH}/${secret}`;

describe('AWS Systems Manager secrets', () => {
  const ssmMock = mockClient(SSMClient);

  beforeEach(() => ssmMock.reset());

  it('should return an array of secret objects', async () => {
    ssmMock.on(GetParametersCommand).resolves({
      InvalidParameters: [],
      Parameters: [
        {
          Name: getSecretPath('secret1'),
          Value: 'secret1_value',
        },
        {
          Name: getSecretPath('secret2'),
          Value: 'secret2_value',
        },
      ],
    });

    const result = await SSM(['secret1', 'secret2']);

    expect(ssmMock.call(0).args[0].input).toEqual({
      Names: [getSecretPath('secret1'), getSecretPath('secret2')],
      WithDecryption: true,
    });

    expect(result).toEqual({
      secret1: {
        Name: getSecretPath('secret1'),
        Value: 'secret1_value',
      },
      secret2: {
        Name: getSecretPath('secret2'),
        Value: 'secret2_value',
      },
    });
  });

  it('should throw an error if there are any invalid parameters', async () => {
    ssmMock.on(GetParametersCommand).resolves({
      InvalidParameters: ['secret1'],
    });

    await expect(SSM(['secret1', 'secret2'])).rejects.toThrow(
      'Invalid key names for AWS Parameter Store: secret1',
    );
  });

  it('should throw an error if the response is empty', async () => {
    ssmMock.on(GetParametersCommand).resolves({
      InvalidParameters: [],
      Parameters: [],
    });

    await expect(SSM(['secret1', 'secret2'])).rejects.toThrow(
      'No parameters returned from AWS Parameter Store',
    );
  });
});
