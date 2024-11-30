import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import dbConnection from '../db/db.js';
const db = await dbConnection()
dotenv.config()

const authenticate = async (req, res, next) => {
    try {
        console.log("Cookie Token" , req.cookies['x-auth-token'])
        
        const token = req.headers['x-auth-token'] || req.cookies['x-auth-token']

        if (!token) {
            return res.status(401).send('No token provided');
        }

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET)
        const { userid, handle, email } = decodedPayload

        const user = await db.get("select * from users where (userid=$userid)" , 
            {
                $userid : userid
            } 
        )

        if (user === undefined) {
            return res.status(400).send('User does not exist. You need to sign up');
        }
        // console.log("user" , user)
        
        // req.user = { userid };  // Add user information to the request object
        res.locals.userid = user.userid
        res.locals.token = token
        // localStorage.setItem('token', token)
        console.log("from auth",res.locals.userid)
        
        next()
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).send('Server error');
    }
};

export default authenticate;