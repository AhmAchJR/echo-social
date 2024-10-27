import sql from "mssql"
import connectDb from "../db/db.js"
const pool = await connectDb()

export const createComment = async (req , res)=>{

    try{
        const userid = res.locals.userid 
        const {content} = req.body
        const postid = parseInt(req.params.postid , 10)

        const request = new sql.Request(pool)
        request.input("userid" , sql.Int , userid)
        request.input("content" , sql.NVarChar , content)
        request.input("postid" , sql.Int , postid)

        const insertQuery = `insert into [comments] (userid , postid , content )
                            output inserted.userid , inserted.content , inserted.postid , inserted.commentid
                            values (@userid , @postid , @content)`
        const insertedComm = await request.query(insertQuery)
        res.status(201)
        .json(
            {
                message :'Comment created successfully' , 
                comment : insertedComm
            })
    }catch(error){
        console.error('Error Get All post:', error)
        res.status(500).send('Server error')
    }
}

export const createReply = async(req, res)=>{

    try{
        const userid = res.locals.userid
        const postid = parseInt(req.params.postid , 10)
        const commid = parseInt(req.params.commentid , 10)
        const { content } = req.body; // Assuming the reply content is sent in the request body

         // Check if the content is provided
        if (!content) {
            return res.status(400).send('Content is required');
        }

        const request = new sql.Request(pool)
        request.input("postid" , sql.Int , postid)
        request.input("userid" , sql.Int , userid)
        request.input("commentid" , sql.Int , commid)
        request.input('content', sql.NVarChar, content)
        
        const selectQuery = `select [comments].* , [post].postid
                            from [comments] inner join [post]
                            on [comments].postid = [post].postid
                            where [comments].commentid  = @commentid`

        const comment = await request.query(selectQuery)
        if(!comment){
            return res.status(400).send("No Comment Or Post")
        }
        const insertQuery = `insert into [comments] (userid , postid , content , parentcommentid)
                            output inserted.userid , inserted.content , inserted.postid , inserted.parentcommentid , inserted.commentid
                            values (@userid , @postid , @content , @commentid)`
        const insertedComment = await request.query(insertQuery)
        res.status(201)
        .json(
            {
                message :'Comment Created Successfully' , 
                comment : insertedComment
            })
    }catch(error){
        console.error('Error Get All post:', error)
        res.status(500).send('Server error')
    }
}

export const updateComment = async (req , res)=>{
        try {
            const commentid = parseInt(req.params.commentid, 10); // Comment ID from URL
            const { content } = req.body; // Updated content from request body
    
            // Check if the content is provided
            if (!content) {
                return res.status(400).send('Content is required');
            }
    
            const request = new sql.Request(pool);
            request.input('commentid', sql.Int, commentid);
            request.input('content', sql.NVarChar, content);
            
            // const selectQuery = `select [comments].* , [post].postid
            //                 from [comments] inner join [post]
            //                 on [comments].postid = [post].postid
            //                 where [comments].commentid  = @commentid`

            // const comment = await request.query(selectQuery)
            // if(!comment){
            //     return res.status(400).send("Comment Not Found")
            // }

            // Update the comment
            const updateQuery = `
                UPDATE [comments]
                SET content = @content
                OUTPUT inserted.userid , inserted.content , inserted.postid , inserted.parentcommentid , inserted.commentid
                WHERE commentid = @commentid;
            `;
            const updatedComment = await request.query(updateQuery)
    
            if (updatedComment.recordset.length === 0) {
                return res.status(404).send('Comment not found');
            }

            res.status(201)
        .json(
            {
                message :'Comment Updated Successfully' , 
                comment : updatedComment
            })
    
        } catch (error) {
            console.error('Error updating comment:', error);
            res.status(500).send('Server error');
        }
    }

export const deleteComment = async(req , res)=>{
    try {

        const commentid = parseInt(req.params.commentid, 10); // Comment ID from URL

        // Check if comment ID is valid
        if (isNaN(commentid)) {
            return res.status(400).send('Invalid comment ID');
        }
        
        
        const request = new sql.Request(pool);
        request.input('commentid', sql.Int, commentid)
        request.input('userid' , sql.Int , res.locals.userid)

        const selectQuery = `select * 
                            from [comments]
                            where [comments].userid = @userid and [comments].commentid = @commentid`
        const selectedUSerComment = await request.query(selectQuery)
        if(!selectedUSerComment){
            return res.status(400).send("You Are Not comment Owner")
        }

        // Delete the comment
        const deleteQuery = `
            DELETE FROM [comments]
            WHERE commentid = @commentid;
        `
        const deletedComment = await request.query(deleteQuery)

        // Check if any rows were affected (i.e., if the comment was found and deleted)
        if (deletedComment.rowsAffected[0] === 0) {
            return res.status(404).send('Comment not found')
        }
        
        res.status(201)
        .json(
            {
                message :'Comment Deleted Successfully' , 
                comment : selectedUSerComment
            })
    

    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Server error');
    }
}

