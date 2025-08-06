import express from 'express'
import {router} from "./routes/index.js";

const app = express()
const PORT = 8080

app.use(express.json())
app.use("/api", router)
app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.listen(PORT, () => {
    console.log(`Example app listening on port http://localhost:${PORT}`)
})