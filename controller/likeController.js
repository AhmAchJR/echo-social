
import sql from "mssql"
import connectDb from "../db/db.js"
const pool = await connectDb()


export const createLike = async(req , res)=>{

        try {
            const { postid } = req.params; // Post ID from URL parameters
            const userid = res.locals.userid; // User ID from authenticated session
    
            // Validate inputs
            if (!postid || isNaN(postid)) {
                return res.status(400).send('Invalid post ID')
            }
    
            const request = new sql.Request(pool);
            request.input('postid', sql.Int, parseInt(postid, 10))
            request.input('userid', sql.Int, userid)
    
            // Check if the like already exists
            const checkQuery = `
                SELECT COUNT(*) AS count
                FROM [likes]
                WHERE postid = @postid AND userid = @userid;
            `
            const checkResult = await request.query(checkQuery)
            console.log(checkResult);
            
            if (checkResult.recordset[0].count > 0) {
                return res.status(400).send('Like already exists')
            }
    
            // Insert a new like
            const insertQuery = `
                INSERT INTO [likes] (postid, userid)
                output [likes].postid , [likes].userid , [likes].likeid
                VALUES (@postid, @userid);
            `;
            const like = await request.query(insertQuery)
            res.status(201)
            .json(
                {
                    message :'Comment Deleted Successfully' , 
                    like : like
                })
        } catch (error) {
            console.error('Error creating like:', error);
            res.status(500).send('Server error');
        }
    }

export const deleteLike = async(req , res)=>{

        try {
            const { postid, likeid } = req.params; // Post ID and Like ID from URL parameters
            const userid = res.locals.userid; // User ID from authenticated session
    
            // Validate inputs
            if (!postid || !likeid || isNaN(postid) || isNaN(likeid)) {
                return res.status(400).send('Invalid post ID or like ID');
            }
    
            const request = new sql.Request(pool);
            request.input('postid', sql.Int, parseInt(postid, 10));
            request.input('likeid', sql.Int, parseInt(likeid, 10));
            request.input('userid', sql.Int, userid);
    
            // Delete the like
            const deleteQuery = `
                DELETE FROM [likes]
                WHERE postid = @postid AND likeid = @likeid AND userid = @userid;
            `;
            const deleteedLike = await request.query(deleteQuery);
    
            if (deleteedLike.rowsAffected[0] === 0) {
                return res.status(404).send('Like not found or not authorized');
            }
    
            res.status(200).json({
                message: 'Like deleted successfully', 
                like : deleteedLike
            });
        } catch (error) {
            console.error('Error deleting like:', error);
            res.status(500).send('Server error');
        }
    
}