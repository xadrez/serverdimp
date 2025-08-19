import express from 'express'
import { sql } from './lib/db.js'
import transactionsRoute from './routes/transactionsRoute.js'
import rateLimiter from './middleware/rateLimiter.js'
import job from './lib/cron.js'
import cors from 'cors'

const app = new express()


if (process.env.MODE_ENV === "production") job.start()
//Middlewares
app.use(cors())
app.use(rateLimiter)
app.use(express.json())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


const PORT = process.env.PORT || 2000

async function initDB() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS transactions(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`
        console.log('SUCCESS!!!')
    } catch (error) {
        console.log('Oops, Something went wrong...', error)
        process.exit(1) // status code 1 means failure, 0 success
    }
}


app.get("/api/health", (req, res) => {
    res.status(200).json({ Status: "Up and kicking..." })
})

app.use("/api/transactions", transactionsRoute)

initDB().then(
    app.listen(PORT, () => {
        console.log(`Server listening at port ${PORT}`)
    })
)