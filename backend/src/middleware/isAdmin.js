// isAdmin middleware — must be used AFTER authMiddleware
// authMiddleware sets req.user; this checks that the user is an admin.
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated.' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied. Admin privileges required.',
        });
    }

    next();
};

module.exports = isAdmin;
