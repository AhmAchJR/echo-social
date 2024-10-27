import sql from 'mssql';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import connectDb from '../db/db.js';

dotenv.config();

const authorizing = async (req, res, next) => {
    try {
        // const pool = await connectDb();
        // const request = new sql.Request(pool);
        const token = req.headers['x-auth-token'];

        if (!token) {
            return res.status(401).send('No token provided');
        }

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET)
        // const { userid, handle, email , role } = decodedPayload

        // request.input('handle', sql.NVarChar, decodedPayload.handle)
        // request.input('email', sql.NVarChar, decodedPayload.email)
        // const selectQuery = `SELECT * FROM [users] WHERE handle = @handle AND email = @email;`
        // const selectedUser = await request.query(selectQuery);

        if(decodedPayload.role.trim() !== 'admin'){
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