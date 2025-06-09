export function successResponse(message: string, data: any, statusCode = 200) {
  return {
    statusCode,
    message,
    data,
  };
}

export function errorResponse(message: string, statusCode = 400, error = 'Bad Request') {
  return {
    statusCode,
    message,
    error,
  };
}
