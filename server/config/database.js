import {Sequelize} from "sequelize";
import dotenv from "dotenv";
import {must} from "../utils/must.js";

dotenv.config()

const DB_NAME = must('DB_NAME');
const DB_USER = must('DB_USER');
const DB_PASS = must('DB_PASS');
const DB_HOST = must('DB_HOST');
const DB_PORT = Number(process.env.DB_PORT ?? 5432);
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false,
});

export default sequelize;