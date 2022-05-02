export default function formatResponse(statusCode: number, payload: object | Error) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(payload, null, 2),
  };
}
