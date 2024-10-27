import sql from "mssql";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDb from '../db/db.js';
import dotenv from "dotenv"
dotenv.config() 


export const logIn = async(req , res)=>{

    const {login, pass} = req.body
    if( !login || !pass){
        res.status(400)
    }

    const pool = await connectDb()
    const request = new sql.Request(pool)
    const selectQuery = `select * from [users] where (handle = @login or email = @login)`
    
    // Set the parameter for the query
    request.input('login', sql.NVarChar, login)

    const selectedUSer = await request.query(selectQuery)
    // // Access the recordset which contains the rows returned by the query
    // const user = result.recordset[0]; // Assuming we are interested in the first row
    if(selectedUSer.recordset.length === 0){
        return res.status(401).send("Invalid login credentials")
    }

    const user = selectedUSer.recordset[0]
    const hashedPass = user.pass

    const isPassValid = await bcrypt.compare(pass , hashedPass)

    if(!isPassValid){
        return res.status(401).send("Invalid login credentials pass")
    }

    const payload = {
        userid : user.userid ,
        handle : user.handle ,
        email : user.email , 
        role : user.role
    }

    const token = jwt.sign(payload , process.env.JWT_SECRET)
    selectedUSer.recordset[0].token = token
    
    res.status(200).json({
        message: "Login successful",
        token: token, // Send the token to the client
        user: user
    });

}