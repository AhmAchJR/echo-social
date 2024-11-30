import sql from "mssql";
import dbConnection from "../db/db.js";

const db = await dbConnection()

export const createComment = async (req, res) => {
    try {
        const userid = res.locals.userid
        const { content } = req.body
        const postid = Number(req.params.postid)

        const selectQuery = `select * from post where postid = $postid;`
        const selectedPost = await db.get(selectQuery , {$postid:postid})
        if(!selectedPost){
            return res.status(400).send("This Post Is Not Exist")
        }

        const insertedComment = await db.run(
            "INSERT INTO comments (userid, postid, content) VALUES ($userid, $postid, $content)",
            {
                $userid: userid,
                $postid: postid,
                $content: content,
            })

        // Access `lastID` and `changes` via `this`
        console.log(`Inserted comment with ID: ${insertedComment.lastID}`);
        console.log(`Rows affected: ${insertedComment.changes}`);

        // Send response back with the inserted comment details
        res.status(201).json({
            message: "Comment created successfully",
            comment: {
                commentId: insertedComment.lastID,  // Include the inserted comment's ID
                userid,
                postid,
                content,
            }
        })

        // Closing the database here is not recommended for every operation.
        // Keep the database open for subsequent requests or handle it centrally.
    } catch (error) {
        console.error("Error creating comment:", error)
        res.status(500).send("Server error")
    }
}


export const createReply = async (req, res) => {
    try {
        const userid = res.locals.userid
        const postid = Number(req.params.postid)
        const commid = Number(req.params.commentid)
        const { content } = req.body; // Assuming the reply content is sent in the request body
        console.log("commid => ", commid)
        
        // Check if the content is provided
        if (!content) {
            return res.status(400).send("Content is required")
        }

        const selectPostQuery = `select * from post where postid = $postid;`
        const selectedPost = await db.get(selectPostQuery , {$postid:postid})
        if(!selectedPost){
            return res.status(400).send("This Post Is Not Exist")
        }

        const selectQuery = `
            SELECT comments.*, post.postid
            FROM comments
            INNER JOIN post ON comments.postid = post.postid
            WHERE comments.commentid = $commentid;
        `
        const selectedParentComment = await db.get(selectQuery, { $commentid: commid })

        if (selectedParentComment) {
            return res.status(400).send("No Comment Or Post");
        }

        const insertQuery = `
            INSERT INTO comments (userid, postid, content, parentcommentid)
            VALUES ($userid, $postid, $content, $commentid);
        `
        const insertedComment = await db.run(insertQuery, {
            $userid: userid,
            $postid: postid,
            $content: content,
            $commentid: commid,
        })

        res.status(201).json({
            message: "Comment Created Successfully",
            comment: insertedComment,
        })
    } catch (error) {
        console.error("Error Create Reply Comment:", error)
        res.status(500).send("Server error")
    }
}


export const updateComment = async (req, res) => {
    try {
        const commentid = Number(req.params.commentid)  // Comment ID from URL
        const postid = Number(req.params.postid)
        const { content } = req.body   // Updated content from request body

        // Check if the content is provided
        if (!content) {
            return res.status(400).send("New Content Is Required")
        }
        
        // const selectPostQuery = `select * from post where postid = $postid;`
        // const selectedPost = await db.get(selectPostQuery , {$postid:postid})
        // if(!selectedPost){
        //     return res.status(400).send("This Post Is Not Exist")
        // }
        // Check if the comment exists
        const selectQuery = `
            SELECT comments.*, post.*
            FROM comments
            INNER JOIN post ON comments.postid = post.postid
            WHERE comments.commentid = $commentid;
        `;
        const commentOfThatPost = await db.get(selectQuery, { $commentid: commentid })

        console.log("Comment:", commentOfThatPost)

        if (!commentOfThatPost) {
            return res.status(400).send("Selected Post That Have This Comment Not Found")
        }
        // Update the comment
        const updateQuery = 'UPDATE comments SET content = $content WHERE commentid = $commentid;'
        const updatedComment = await db.run(updateQuery,{$commentid : commentid})
        console.log(updatedComment)
        if (!updatedComment) {
            return res.status(404).send("Update Comment Failed")
        }

        res.status(201).json({
            message: "Comment Updated Successfully",
            comment: updatedComment,
        });
    } catch (error) {
        console.error("Error updating comment:", error)
        res.status(500).send("Server error")
    }
}

export const deleteComment = async (req, res) => {
    try {
        const commentid = parseInt(req.params.commentid, 10)  // Comment ID from URL
        const userid = res.locals.userid   // User ID from local data

        // Check if the comment ID is valid
        if (isNaN(commentid)) {
            return res.status(400).send("Invalid comment ID")
        }

        // Check if the user owns the comment
        const selectQuery = `
            SELECT * 
            FROM comments
            WHERE userid = $userid AND commentid = $commentid;
        `
        const selectedUserComment = await db.get(selectQuery, { $userid: userid, $commentid: commentid })

        if (!selectedUserComment) {
            return res.status(403).send("You are not the owner of this comment")
        }

        // Delete the comment
        const deleteQuery = `
            DELETE FROM comments
            WHERE commentid = $commentid;
        `
        const result = await db.run(deleteQuery, { $commentid: commentid })

        // Check if any rows were deleted
        if (result.changes === 0) {
            return res.status(404).send("Comment not found")
        }

        res.status(200).json({
            message: "Comment Deleted Successfully",
            comment: selectedUserComment,
        })
    } catch (error) {
        console.error("Error deleting comment:", error)
        res.status(500).send("Server error")
    }
};

