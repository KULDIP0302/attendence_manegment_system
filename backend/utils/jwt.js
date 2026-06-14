const jwt = require('jsonwebtoken');

function getJwtSecret() {
    // Backward compatibility: older env files may still use SECRET_KEY.
    const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
    if (!secret) {
        throw new Error('JWT_SECRET (or SECRET_KEY) is not set');
    }
    return secret;
}

function signToken(payload, options = {}) {
    const expiresIn = options.expiresIn || process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

module.exports = { signToken };

