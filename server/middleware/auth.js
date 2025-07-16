const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ 
            msg: 'No token, authorization denied',
            code: 'NO_TOKEN'
        });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;

    try {
        // Try to verify with main secret first
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (mainError) {
            // If main secret fails, try fallback secret for demo mode
            try {
                decoded = jwt.verify(token, 'fallback_secret');
                console.log('Using fallback JWT verification');
            } catch (fallbackError) {
                throw mainError; // Throw the original error
            }
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        console.log('Auth Error:', err.message);
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                msg: 'Token has expired, please login again',
                code: 'TOKEN_EXPIRED'
            });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                msg: 'Invalid token format',
                code: 'INVALID_TOKEN'
            });
        } else {
            return res.status(401).json({ 
                msg: 'Token is not valid',
                code: 'AUTH_FAILED'
            });
        }
    }
}

module.exports = auth;
