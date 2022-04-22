function formatResponse(statusCode, payload) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(payload, null, 2),
  };
}

module.exports = formatResponse;
