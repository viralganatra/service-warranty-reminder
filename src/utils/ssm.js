const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm');

const client = new SSMClient();

async function getSSMParams(params) {
  const inputParams = { Names: params, WithDecryption: true };
  const input = new GetParametersCommand(inputParams);
  const resp = await client.send(input);

  const data = resp.Parameters.reduce((acc, param) => ({
    ...acc,
    [param.Name]: param,
  }), {});

  return data;
}

module.exports = getSSMParams;
