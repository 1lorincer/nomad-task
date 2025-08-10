import express from "express";
import api from "./routes/index.js";

const app = express()
app.use(express.json())
app.get('/health', (_req, res) => res.json({ok: true}));
app.use('/api', api);
app.use((_req, res) => res.status(404).json({message: 'Not found'}));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({message: err.message || 'Server error'});
});

export default app;
