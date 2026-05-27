exports.checkRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== requiredRole) {
            console.warn(`[Access Denied] User ${req.user?.email || 'unknown'} attempted to access ${requiredRole} route`);
            return res.status(403).json({ error: 'Forbidden: Insufficient privileges.' });
        }
        next();
    };
};
