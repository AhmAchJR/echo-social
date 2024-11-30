import sql from 'mssql';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import dbConnection from '../db/db.js';

dotenv.config();
const db = await dbConnection()

const authorizing = async (req, res, next) => {
    try {
        const token = req.headers['x-auth-token'];

        if (!token) {
            return res.status(401).send('No token provided');
        }

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET)
        const { userid, handle, email , role } = decodedPayload
        
        const selectedUser = await db.get("select * from users where (userid=$userid AND email=$email AND role=$role",
            {
                $userid : userid , 
                $email : email , 
                $role : role
            },
            function(err , raw){
                if(err){
                    console.error("Error Selecting Data:", err)
                }

                return raw
            }
        )
        if(decodedPayload.role.trim() !== selectedUser.role){
            return res.status(401).json({
                message : "Your Are Not Authorized"
            })
        }

        // if (selectedUser.recordset.length === 0) {
        //     return res.status(400).send('User does not exist. You need to sign up');
        // }

        // req.user = { userid };  // Add user information to the request object
        res.locals.userid = decodedPayload.userid
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).send('Server error');
    }
}

export default authorizing