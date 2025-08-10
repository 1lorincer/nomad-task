import {sequelize} from './models/index.js';
import app from "./app.js"
const PORT = process.env.PORT || 3000;

const startApp = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log(`Db connected: ${sequelize.config.database}`)
        app.listen(PORT, () => {
            console.log(`Example app listening on port http://localhost:${PORT}`)
        })
    } catch (error) {
        console.log(`Server crashed: ${error}`)
    }
}

startApp();