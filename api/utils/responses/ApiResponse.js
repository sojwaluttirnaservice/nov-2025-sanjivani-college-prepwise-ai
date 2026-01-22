const sendSuccess = (
  _res,
  _statusCode = 200,
  _message = "",
  _data = null,
  _error = null
) => {
  return _res.status(_statusCode).json({
    statusCode: _statusCode,
    success: true,
    message: _message,
    data: _data,
    error: _error,
  });
};

const sendError = (
  _res,
  _statusCode = 500,
  _message = "",
  _data = null,
  _error = null
) => {
  return _res.status(_statusCode).json({
    statusCode: _statusCode,
    success: false,
    message: _message,
    data: _data,
    error: _error,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
