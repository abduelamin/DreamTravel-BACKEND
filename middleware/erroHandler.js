export const errorHandler = (err, req, res, next) => {
  console.log(err.stack);
  // handler for register path
  if (err.status === 500 && err.name === "FailedToRegister") {
    return res.status(500).json({ message: err.message });
  }

  if (err.name === "AlreadyExist") {
    return res.status(400).json({ message: err.message });
  }

  //Login handelr
  if ((err.status === 401 && err.name === "userNotFound")) {
    return res.status(401).json({ message: err.message });
  }

  if ((err.status === 403 && err.name === "incorrectCredentials")) {
    return res.status(403).json({ message: err.message });
  }

  // Fallback/catch all for unhandled errors
  res.status(err.status || 500).json({
    message: err.message || "An unexpected error occurred.",
  });
};
