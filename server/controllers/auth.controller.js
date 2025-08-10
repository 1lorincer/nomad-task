import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {User} from '../models/index.js';

class AuthController {
    async register(req, res) {
        const {username, firstName, lastName, email, password, role = 'user'} = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({username, firstName, lastName, email, passwordHash, role});
        const token = jwt.sign({id: user.id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.status(201).json({token});
    }

    async login(req, res) {
        const {email, password} = req.body;
        const user = await User.findOne({where: {email}});
        if (!user) return res.status(401).json({message: 'Bad credentials'});
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({message: 'Bad credentials'});
        const token = jwt.sign({id: user.id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.json({token});
    }
}

export default new AuthController();
