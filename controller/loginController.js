import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dbConnection from '../db/db.js';
import dotenv from "dotenv"
dotenv.config() 

const db = await dbConnection()

export const logIn = async(req , res)=>{
    try{

        const {login , pass} = req.body

        if( !login || !pass){
            res.status(400).send("All Fields Required")
        }
        
        const user = await db.get("select * from users where (handle=$login or email=$login)",
            {
                $login : login
            } )

        console.log(user)
        console.log("Password from request:", pass)
            
        if(!user){
            return res.status(401).send("Invalid login credentials")
        }
    
        const hashedPass = user.pass
        console.log("Hashed password from DB:", hashedPass)
    
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
        user.token = token
        
        // return res.status(200).json({
        //     message: "Login successful",
        //     token: token, // Send the token to the client
        //     user: user
        // });

        // return res.redirect(`/profile/${user.userid}`)
        // return res.render("profile", {
        //     profile : user , 
        //     token
        // })
        res.cookie('x-auth-token', token)
        return res.redirect('profile')
    }catch(error){
            console.error("Error Loging :", error)
            res.status(500).send("Server error")
    }
}
