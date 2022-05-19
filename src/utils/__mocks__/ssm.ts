export default function getSSMParams(params: string[]) {
  const map: Record<string, { Name: string; Value: string }> = {};

  for (const param of params) {
    map[param] = { Name: param, Value: param };
  }

  return map;
}
