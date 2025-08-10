import jwt from 'jsonwebtoken';
import {User} from '../models/index.js';

export function authRequired(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({message: 'No token'});
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({message: 'Invalid token'});
    }
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({message: 'Unauthorized'});
        if (!roles.includes(req.user.role)) return res.status(403).json({message: 'Forbidden'});
        next();
    };
}

export async function attachUser(req, _res, next) {
    if (!req.user?.id) return next();
    req.currentUser = await User.findByPk(req.user.id);
    next();
}
