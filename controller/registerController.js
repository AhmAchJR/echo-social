import sql from 'mssql';
import jwt from 'jsonwebtoken';
import connectDb from '../db/db.js';
import bcrypt from 'bcrypt';

export const signUp = async(req , res)=>{
    const {pass , email , handle} = req.body

    if(!pass || !email || !handle){
        return res.status(400).send("All Fields Are Required")
    }
    const pool = await connectDb()
    const request = new sql.Request(pool)
    const selectQuery = `select * from [users] where handle = @selectedhandle`
    request.input('selectedhandle' , sql.NVarChar , handle)
    const user = await request.query(selectQuery)
    console.log(user.recordset);

    if(user.recordset.length !=0){
        return res.status(400).send("User Already Exist")
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(pass ,salt)

    const picPath = req.file.path
    
    const insertQuery = `insert into [users] (pass , email , handle , pic)
                        output inserted.email , inserted.handle , inserted.username, inserted.userid , inserted.pic 
                        values(@pass , @email , @handle , @pic)`
    request.input('pass' , sql.NVarChar , hashedPass)
    request.input('email' , sql.NVarChar , email)
    request.input('handle' , sql.NVarChar , handle)
    request.input('pic' , sql.NVarChar , picPath)    
    const insertedUser = await request.query(insertQuery)

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