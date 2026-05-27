exports.errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    
    // Do not leak stack traces to client
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: err.customMessage || 'An unexpected error occurred on the server.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};
