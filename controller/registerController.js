import jwt from 'jsonwebtoken';
import dbConnection from '../db/db.js';
import bcrypt from 'bcrypt';

const db = await dbConnection()
// console.log(db)


export const signUp = async(req , res)=>{
    const {pass , email , handle} = req.body

    if(!pass || !email || !handle){
        return res.status(400).send("All Fields Are Required")
    }
    
    const row = await db.get("select * from users where handle = $handle or email = $email" , 
        {
            $handle : handle , 
            $email : email
        } 
    )
    console.log(row);

    if(row){
        return res.status(400).send("User Already Exist")
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(pass ,salt)

    console.log(req.files)

    // Ensure file is uploaded
    if (!req.file) {
        return res.status(400).send("Profile image is required");
    }
    const picPath = req.file.path
    
    console.log(picPath)
    await db.run("insert into users (pass , email , handle , pic) values($pass , $email , $handle , $pic)" , 
        {
            $pass : hashedPass , 
            $email : email , 
            $handle : handle , 
            $pic : picPath
        }
    )

    const insertedUser = await db.get("select * from users where handle = $handle or email = $email" , 
        {
            $handle : handle , 
            $email : email
        } 
        
    )

    res.status(201).json({
        message: "User Registered Successfully",
        user : insertedUser
    })
}














































/*
By default, the INSERT statement in SQL Server does not return any data about the newly inserted row. 
The result typically includes rowsAffected, 
which tells you how many rows were affected by the operation (in your case, 1 row).
Using the OUTPUT Clause:

To get information about the newly inserted row, 
you should use the OUTPUT clause in your INSERT statement. 
The OUTPUT clause allows you to capture the inserted row's data and return it as part of the query result.

Without OUTPUT Clause: The INSERT statement does not return details of the inserted row, 
only the number of rows affected.

With OUTPUT Clause: You can return the inserted row's details 
by specifying the columns you want to retrieve using the OUTPUT clause.
By including the OUTPUT clause in your INSERT statement, 
you will be able to retrieve and return the details of the newly inserted user as part of the response.

Clause = بند - جملة
*/