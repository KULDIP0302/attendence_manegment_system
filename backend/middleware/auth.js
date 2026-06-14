const jwt = require('jsonwebtoken');

function getJwtSecret() {
    // Backward compatibility: older env files may still use SECRET_KEY.
    const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
    if (!secret) {
        throw new Error('JWT_SECRET (or SECRET_KEY) is not set');
    }
    return secret;
}

function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const [type, token] = header.split(' ');

        if (type !== 'Bearer' || !token) {
            return res.status(401).json({ message: 'Missing or invalid Authorization header' });
        }

        const payload = jwt.verify(token, getJwtSecret());
        req.user = payload; // { id, role, school? }
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        const role = req.user?.role;
        if (!role || !roles.includes(role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        return next();
    };
}

module.exports = { requireAuth, requireRole };

