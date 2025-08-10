import {Product} from '../models/index.js';

class ProductController {
    async list(_req, res) {
        const items = await Product.findAll({order: [['id', 'DESC']]});
        res.json(items);
    }

    async create(req, res) {
        const item = await Product.create(req.body);
        res.status(201).json(item);
    }

    async update(req, res) {
        const {id} = req.params;
        const item = await Product.findByPk(id);
        if (!item) return res.sendStatus(404);
        await item.update(req.body);
        res.json(item);
    }

    async remove(req, res) {
        const {id} = req.params;
        await Product.destroy({where: {id}});
        res.sendStatus(204);
    }
}

export default new ProductController();
