import { ApiError } from "../utils/ApiError.js";

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, [], error.stack);
  }

  // Log error in development
  if (process.env.NODE_ENV !== "production") {
    console.error("Error:", {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
    });
  }

  // Send response
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
};

export { errorHandler };
