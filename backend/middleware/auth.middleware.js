const jwt = require('jsonwebtoken');
const JWT_SECRET = "secret";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication invalid: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { id: payload.id, role: payload.role };
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Authentication invalid: Invalid token' });
    }
};

module.exports = { authMiddleware };
