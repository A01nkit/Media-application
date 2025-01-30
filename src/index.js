//import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from "./app.js"
/*
dotenv.config({
    path: './env'
})
*/

connectDB()
.then(() => {
    //we are listening error for an event. i.e; listening after db connection and before server listening
    app.on("error", (error) => {
        console.log("ERROR: ", error);
        throw error;   
    })
    app.listen(process.env.PORT || 2000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!!" , err);
})
















































/*
USING AFFI

import express from "express"
const app = express()

;( async () => { 
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;  
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/