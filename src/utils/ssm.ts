import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { SSMInvalidSecretsError, SSMNoParametersError } from '../errors';
import { ParameterWithRequired } from '../types/parameter';

const client = new SSMClient({ region: process.env.AWS_REGION });
const pathPrefix = `${process.env.SSM_PATH}/`;

export async function getSSMParams<T extends string>(
  params: T[],
): Promise<Record<T, ParameterWithRequired>> {
  const paramsWithPath = params.map((p) => `${pathPrefix}${p}`);
  const inputParams = { Names: paramsWithPath, WithDecryption: true };
  const input = new GetParametersCommand(inputParams);

  const resp = await client.send(input);

  if (resp.InvalidParameters?.length) {
    throw new SSMInvalidSecretsError(
      `Invalid key names for AWS Parameter Store: ${resp.InvalidParameters.join(', ')}`,
    );
  }

  if (!resp.Parameters?.length) {
    throw new SSMNoParametersError('No parameters returned from AWS Parameter Store');
  }

  const map: Record<string, ParameterWithRequired> = {};

  for (const field of resp.Parameters as ParameterWithRequired[]) {
    if (field.Name && paramsWithPath.includes(field.Name)) {
      const name = field.Name.replace(pathPrefix, '');

      map[name] = field;
    }
  }

  return map;
}
