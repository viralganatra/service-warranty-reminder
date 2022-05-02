import { SSMClient, GetParametersCommand, Parameter } from '@aws-sdk/client-ssm';
import { ParameterWithRequired } from 'src/types/secrets';

const client = new SSMClient({ region: process.env.AWS_REGION });
const pathPrefix = `${process.env.SSM_PATH}/`;

export default async function getSSMParams<T extends string>(
  params: T[],
): Promise<Record<T, ParameterWithRequired>>;

export default async function getSSMParams(params: string[]): Promise<Record<string, Parameter>> {
  const paramsWithPath = params.map((p) => `${pathPrefix}${p}`);
  const inputParams = { Names: paramsWithPath, WithDecryption: true };
  const input = new GetParametersCommand(inputParams);

  try {
    const resp = await client.send(input);

    if (resp.InvalidParameters?.length) {
      throw new Error(
        `Invalid key names for AWS Parameter Store: ${resp.InvalidParameters.join(', ')}`,
      );
    }

    const map: Record<string, Parameter> = {};

    if (resp.Parameters) {
      for (const field of resp.Parameters) {
        if (field.Name && paramsWithPath.includes(field.Name)) {
          const name = field.Name.replace(pathPrefix, '');
          const isValidParam = params.includes(name);

          map[name] = isValidParam ? field : {};
        }
      }
    }

    return map;
  } catch (err) {
    console.log(err);

    throw new Error('Failed to get secrets');
  }
}
