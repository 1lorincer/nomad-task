import express from "express";
import cors from 'cors';
import api from "./routes/index.js";

const app = express()
const corsOptions = {
    origin: ['http://localhost:5050', 'http://127.0.0.1:5050'],
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true,
    maxAge: 86400
};
app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));
app.use(express.json())
app.get('/health', (_req, res) => res.json({ok: true}));
app.use('/api', api);
app.use((_req, res) => res.status(404).json({message: 'Not found'}));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({message: err.message || 'Server error'});
});

export default app;
