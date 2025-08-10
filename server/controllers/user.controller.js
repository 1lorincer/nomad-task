import {User} from '../models/index.js';

class UserController {
    async me(req, res) {
        const u = req.currentUser;
        res.json({
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.role,
            firstName: u.firstName,
            lastName: u.lastName
        });
    }
        
    async list(_req, res) {
        const users = await User.findAll({attributes: ['id', 'username', 'email', 'role', 'firstName', 'lastName']});
        res.json(users);
    }
}

export default new UserController();
