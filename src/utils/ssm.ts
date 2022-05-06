import { SSMClient, GetParametersCommand, Parameter } from '@aws-sdk/client-ssm';
import { ParameterWithRequired } from '../types/secrets';
import { SSMInvalidSecretsError, SSMNoParametersError } from '../errors';

const client = new SSMClient({ region: process.env.AWS_REGION });
const pathPrefix = `${process.env.SSM_PATH}/`;

export default async function getSSMParams<T extends string>(
  params: T[],
): Promise<Record<T, ParameterWithRequired>>;

export default async function getSSMParams(params: string[]): Promise<Record<string, Parameter>> {
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

  const map: Record<string, Parameter> = {};

  for (const field of resp.Parameters) {
    if (field.Name && paramsWithPath.includes(field.Name)) {
      const name = field.Name.replace(pathPrefix, '');
      const isValidParam = params.includes(name);

      map[name] = isValidParam ? field : {};
    }
  }

  return map;
}
