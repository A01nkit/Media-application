import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

// configuring, what type of date we can get.
app.use(express.json({limit: "20kb"}))//json data from frontend
app.use(express.urlencoded({extended: true, limit: "16kb"}))//data from url
app.use(express.static("public")) 
app.use(cookieParser()) 

export { app } 