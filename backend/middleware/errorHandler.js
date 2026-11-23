const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('API Error:', err);

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    const message = `A record with this ${fields} already exists. Please use unique values.`;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: err.meta?.cause || 'Requested record was not found.',
    });
  }

  // Prisma foreign key constraint violation (P2003)
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Invalid foreign key reference. The related record does not exist.',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authorization token has expired. Please login again.',
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error. An unexpected error occurred.',
  });
};

module.exports = errorHandler;
