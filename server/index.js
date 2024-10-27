import express from "express"
import sql from "mssql"
import sqlconfig from "./config.js"
import { fileURLToPath } from "url"
import path from 'path';
import fs from 'fs/promises'; // Use 'fs/promises' for promise-based fs methods
import connectDb from "../db/db.js";

import registerRouter from '../routes/register.js'
import loginRouter from '../routes/login.js'
import postRouter from '../routes/post.js'
import userRouter from '../routes/user.js'
import commentRouter from '../routes/comment.js'
import likeRouter from '../routes/likes.js'


import authenticate from "../middlewares/authenticate.js";
import { uploadPostImg, uploadProfileImg } from "../middlewares/uploadMiddleware.js";
import { use } from "bcrypt/promises.js";

console.log('DB_SERVER: ', process.env.DB_SERVER);
console.log('DB_PORT: ', process.env.DB_PORT);
// console.log('enviromentT:', process.env);

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// console.log(__dirname)
const migrationFile = path.join(__dirname , '../migrations' , '001-initial.sql')
console.log(migrationFile);


(async () => {
    try {

        const pool = await connectDb()
        console.log('Connected to SQL Server and database.');
        
        // Read and execute migration script
        const request = new sql.Request(pool)
        const sqlQueries = await fs.readFile(migrationFile, 'utf-8');
        await request.query(sqlQueries);        
        console.log('Migration script executed successfully.');

        // console.dir(result);
        // console.log(result);
        
    } catch (err) {
        console.error('Error executing migration script:', err);
        process.exit(1); // Exit the process with a non-zero status code
    }
})();




const app = express()
const PORT = process.env.PORT || 8000
app.use(express.json())

/*This is the default format for form submissions. For this,
you use the express.urlencoded middleware to parse the form data*/

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname , "../images/postImages")))

/*This is the default format for form submissions. For this,
you use the express.urlencoded middleware to parse the form data*/

// Middleware to parse URL-encoded bodies

app.use("/healthz" , (req , res)=>{res.send({status : "ok"})})
app.use("/register" , uploadProfileImg.single("image") , registerRouter)
app.use("/login" , loginRouter)
app.use("/post"   , postRouter)
app.use("/user" , userRouter)
app.use("/post" , commentRouter)
app,use('/post' , likeRouter)
//req.files : An array containing information about each uploaded file.
app.listen(PORT , ()=> {console.log("welcome")})