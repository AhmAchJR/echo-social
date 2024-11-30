import express from "express"
import http from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from "url"
import path from 'path';
import cookieParser from 'cookie-parser'
import fs from 'fs/promises'; // Use 'fs/promises' for promise-based fs methods
import dbConnection from "../db/db.js";

import registerRouter from '../routes/register.js'
import loginRouter from '../routes/login.js'
import postRouter from '../routes/post.js'
// import userRouter from '../routes/user.js'
import commentRouter from '../routes/comment.js'
import likeRouter from '../routes/likes.js'
import friendRouter from "../routes/friend.js"
import profileRouter from "../routes/profile.js"

import authenticate from "../middlewares/authenticate.js";
import { uploadPostImg, uploadProfileImg } from "../middlewares/uploadMiddleware.js";
import { Socket } from "dgram";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// console.log(__dirname)
const migrationFile = path.join(__dirname , '../migrations' , '001-initial.sql')
console.log(migrationFile);


(async () => {
    const db = await dbConnection()
    // console.log(db)
    
})()

const app = express()
const httpServer = http.createServer(app)
const socketServer = new Server(httpServer) 
const PORT = process.env.PORT || 8000
app.use(express.json())

/*This is the default format for form submissions. For this,
you use the express.urlencoded middleware to parse the form data*/

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }))
// Add the cookie-parser middleware before your routes
app.use(cookieParser())
app.use(express.static(path.join(__dirname , "../images/postImages")))
app.use('/profileImages', express.static(path.join(__dirname, "../images/profileImages")));
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files
app.set("view engine" , "ejs")
app.set("views", path.join(__dirname, "../views"))

/*This is the default format for form submissions. For this,
you use the express.urlencoded middleware to parse the form data*/

// Middleware to parse URL-encoded bodies

socketServer.on("connection" , (socket)=>{
    console.log(socket.id)
    console.log("new user")

    socket.on("clientEventData" , (data)=>{
        console.log("Data Recived From Client" , data)
        // socket.emit("serverEvent")
        // socketServer.emit("serverEvent")
        socket.broadcast.emit("serverEvent")
    })

    socket.on("join" , ()=>{
        console.log("You Are Joined")
        socket.join("myRoom")
    })

    socket.on("sendMsg" , (msg)=>{
        console.log( "The Message Is : " , msg)
        socketServer.to("myRoom").emit("newMsg" , {msg})
    })

})


app.use("/healthz" , (req , res)=>{res.send({status : "ok"})})
app.use("/register" , (req, res, next) => {
    console.log("File:", req.file); // Logs the uploaded file details
    console.log("Headers:", req.headers)
    console.log("Body:", req.body)
    next();
},registerRouter)
app.use("/login" , loginRouter)
app.use("/post"   , postRouter)
// app.use("/user" , userRouter)
app.use("/profile" , profileRouter)
app.use("/friend" , friendRouter)
app.use("/post" , commentRouter)
app.use('/post' , likeRouter)

httpServer.listen(PORT , ()=> {console.log("welcome")})