
import dbconnection from '../db/db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import Message from 'tedious/lib/message.js'
dotenv.config()
const db = await dbconnection()

export const getUserById = async (req, res) => {
    
    const userid = Number(req.params.id)
    if(!userid) return res.redirect("/user/" + res.locals.userid)
    try {
        // Query to select user by ID
        const selectQuery = `
            SELECT userid, email, handle, bio, username, pic 
            FROM users 
            WHERE userid = ?;
        `

        // Execute the query
        const user = await db.get(selectQuery, [userid])

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Send the response with the user data
        // return res.status(200).json({
        //     message: "User",
        //     user: user
        // })

        return res.render("profile" , user)
    } catch (error) {
        console.error("Error Get User:", error)
        return res.status(500).send("Server error")
    }
}

export const updateUser = async (req , res)=>{

    try{
        const objectToUpdate = req.body // Fields to be updated

        if(res.locals.userid !== parseInt(req.params.id)){
            return res.status(401).send("You Can Not Edit This User")
        }

        if (Object.keys(objectToUpdate).length === 0) {
            return res.status(400).send("No fields provided to update");
        }
        const pool = await connectDb()
        const request = new sql.Request(pool)

        // Add user ID as input parameter
        request.input('userid', sql.Int, req.params.id)
        
        const sqlTypeMapping  = {
            email : sql.NVarChar , 
            handel : sql.NVarChar , 
            bio : sql.NVarChar , 
            usernaem : sql.NVarChar , 
            pic : sql.NVarChar 
        }

        let setclause = []

        const arrayFieldsToUpdate = Object.keys(objectToUpdate) // array of fields that is in the body object and this fields is string  
        arrayFieldsToUpdate.forEach((field)=>{
            if(field !== 'userid' && objectToUpdate[field] !== undefined /* mean by objectToUpdate the original object i take it from body object*/){
                const sqlType = sqlTypeMapping[field] || sql.NVarChar 
                request.input(field , sqlType , objectToUpdate[field])
                setclause.push(`${field} = @${field}`)
            }
        })

        const updateQuery = `update [users] 
                            set ${setclause.join(" , ")}
                            output inserted.*
                            where userid = @userid;`
        const updatedUSer = await request.query(updateQuery)
        res.status(200).json({
            message : "Update User Sucssefully", 
            newuser : updatedUSer
        })
    }catch(error){
        console.error('Authentication error:', error)
        res.status(500).send('Server error')
    }
}

export const deleteUser = async (req , res)=>{

    try{
        const pool = await connectDb()
        const request = new sql.Request(pool)
        request.input("userid" , sql.Int , req.params.id)
        const deleteQuery = `delete from [users] where userid = @userid`
        const deletedUSer = await request.query(deleteQuery)
        res.status(200).json({
            message : "Delete User Successfully", 
            newuser : deletedUSer
        })

    }catch(error){
        console.error('Authentication error:', error)
        res.status(500).send('Server error')
    }
}



/*

Object.keys() is a method provided by JavaScript’s Object class. 
It is used to extract the keys (property names) from an object.

Object.keys() Method
Purpose: Retrieves an array of the keys (property names) from an object.
Syntax: Object.keys(obj)
obj: The object whose keys you want to retrieve.

The Object Class
The Object class in JavaScript is a built-in class that provides methods for working with objects.
Object.keys() is one of these methods.

Objects with Object.keys()
The Object.keys() method can be called on any JavaScript object 
that is a plain object or one that inherits from Object.prototype.

This includes:
Plain Objects: {} (e.g., const obj = { key1: value1, key2: value2 };)
Objects Created with new Object(): new Object() (e.g., const obj = new Object(); obj.key1 = value1;)

Important Notes
Inherits Object.prototype: Objects created with {} or new Object() inherit from Object.prototype 
and can use Object.keys().

Non-Plain Objects: Some special objects or instances (like those created with classes or built-in objects like Map) 
do not necessarily support Object.keys() in the same way, and their behavior might differ.

*/

/*

Use forEach: When you need to perform an action with each item in an array 
and don’t need a new array as a result. 
does not return a new array. It returns undefined, 
which means it is used purely for side effects.

Use map: When you need to create a new array where each element 
is a transformed version of the original elements.

*/