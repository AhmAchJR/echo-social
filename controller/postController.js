import sql from "mssql"
import connectDb from "../db/db.js"
const pool = await connectDb()
import path from 'path'

export const getAllPosts = async(req , res)=>{
    try{

    const request = new sql.Request(pool)
    const selectQuery = `select [images].imgurl , [post].* from [post] inner join [images] on [images].postid = [post].postid`
    const allPosts = await request.query(selectQuery)
    return res.status(200).json({
        message : "All Posts" , 
        Post : allPosts.recordset
    })
    }catch(error){
        console.error('Error Get All post:', error)
        res.status(500).send('Server error')
    }
} 

export const getPostById = async(req , res)=>{
    
    try{

    const postid = parseInt(req.params.id , 10)
    
    if (isNaN(postid)) {
        return res.status(400).json({ message: 'Invalid post ID' });
    }
    const request = new sql.Request(pool)
    request.input("postid" , sql.Int , postid)

    const selectQuery = `select [images].imgurl , [post].* from [post] inner join [images] 
                        on [images].postid = [post].postid 
                        where post.postid = @postid;`
    
    const post = await request.query(selectQuery)
    return res.status(200).json({
        message : "Your Post" , 
        post : post
    })
    }catch (error) {
        console.error('Error Get post:', error)
        res.status(500).send('Server error')
    }
}

export const createPost = async(req , res)=>{
    const request = new sql.Request(pool)

    const {content , visibility} = req.body
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);

    if(!content){
        return res.status(400).send('Content is required')
    }
    const userid = res.locals.userid
    let insertedImgUrls = []
    try{
        const insertQuery = `insert into [post] (userid , content , visibility)
                                output inserted.userid , inserted.content , inserted.visibility , inserted.postid
                                values (@userid , @content , @visibility)`
        request.input('userid' , sql.Int , userid)
        request.input('content' , sql.NVarChar , content)
        request.input('visibility', sql.NVarChar, visibility || 'public')
        
        const insertedPost = await request.query(insertQuery)
        const postid = insertedPost.recordset[0].postid

        const imgUrls = req.files.map(file =>{
            return `${file.path}`
        })

        if(imgUrls.length>0){

            const imageInsertPromises = imgUrls.map((url)=>{
                const insertImg = `insert into [images] (postid , imgurl)
                                    output inserted.imgurl
                                    values (@postid , @url)`
                request.input("postid" , sql.Int , postid)
                request.input("url" , sql.NVarChar , url)

                return request.query(insertImg)
            })

            insertedImgUrls =  await Promise.all(imageInsertPromises)
            console.log(insertedImgUrls)
        }

        res.status(201)
        .json(
            {message :'Post created successfully' , 
                post : insertedPost , 
                visibility : insertedPost.recordset[0].visibility,
                content : insertedPost.recordset[0].content , 
                images : insertedImgUrls
            });

    }catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Server error');
    }

}

export const deletePost = async (req , res)=>{
    const postid = parseInt(req.params.id, 10);
    const userid = res.locals.userid; // Assuming you set user id in `res.locals` from middleware

    try {
        const pool = await connectDb();
        const request = new sql.Request(pool);
        request.input("postid", sql.Int, postid);
        request.input("userid", sql.Int, userid);

        // Check if the post exists and belongs to the user
        const selectQuery = `
            SELECT userid FROM [post] WHERE postid = @postid;
        `;
        const result = await request.query(selectQuery);

        if (result.recordset.length === 0) {
            return res.status(404).send("Post not found");
        }

        const postOwner = result.recordset[0].userid;
        if (userid !== postOwner) {
            return res.status(403).send("You do not have permission to delete this post");
        }

        // Delete the post and associated images
        const deleteQuery = `
            BEGIN TRANSACTION;

            BEGIN TRY
                -- Delete associated images
                DELETE FROM [images] WHERE postid = @postid;

                -- Delete the post
                DELETE FROM [post] WHERE postid = @postid;

                COMMIT TRANSACTION;
            END TRY
            BEGIN CATCH
                ROLLBACK TRANSACTION;
                SELECT ERROR_MESSAGE() AS ErrorMessage;
            END CATCH;
        `;

        const deletePost = await request.query(deleteQuery);

        res.status(200).json({
            message: "Post deleted successfully" , 
            deletedPost : deletePost
        });
    } catch (error) {
        console.error('Error deleting post: ', error);
        res.status(500).send('Server error');
    }
}

export const updatePost = async(req , res)=>{

        const postid = parseInt (req.params.id , 10)
        const uploadedFiles = req.files; // Assuming `upload.array('images')` for multiple files
        const newPostObject = req.body
        console.log(newPostObject)

        try {
            const pool = await connectDb()
            const request = new sql.Request(pool)
            request.input("postid", sql.Int, postid)
            request.input("userid", sql.Int, res.locals.userid)
    
            // Retrieve the post to check ownership
            const selectQuery = `SELECT userid FROM [post] WHERE postid = @postid`;
            const selectedPost = await request.query(selectQuery);
    
            if (res.locals.userid !== selectedPost.recordset[0].userid) {
                return res.status(401).send("Not Your Post");
            }

            if (Object.keys(newPostObject).length === 0 && !uploadedFiles) {
                return res.status(400).send("No fields provided to update");
            }   

            if (Object.keys(newPostObject).length === 0) {
                return res.status(400).send("No fields provided to update");
            }
    
            const arrayFieldsToBeUpdate = Object.keys(newPostObject);
    
            let setPostClause = [];
            let setImgClause = [];
    
            const sqlTypeMapping = {
                content: sql.NVarChar,
                visibility: sql.NVarChar,
                imgurl: sql.NVarChar
            };
            
            console.log(arrayFieldsToBeUpdate)
            
            arrayFieldsToBeUpdate.forEach(field => {
                if (newPostObject[field] !== undefined) {
                    const sqlType = sqlTypeMapping[field];
                    if (sqlType) {
                        request.input(field, sqlType, newPostObject[field]);
                        setPostClause.push(`post.${field} = @${field}`);
                    }
                }
            })

            // Handle image updates
        if (uploadedFiles && uploadedFiles.length > 0) {
            uploadedFiles.forEach(file => {
                // Assume images have a column like `imgurl`
                setImgClause.push(`images.imgurl = '${file.path}'`);
            })
        }

            
            console.log(setImgClause)
            console.log(setPostClause)
            
            const updateQuery = `
                BEGIN TRANSACTION;
    
                BEGIN TRY
                    -- Update the [post] table
                    UPDATE [post]
                    SET ${setPostClause.join(", ")}
                    FROM [post] 
                    WHERE [post].postid = @postid;
    
                    -- Update the [images] table
                    UPDATE [images]
                    SET ${setImgClause.join(", ")}
                    FROM [images] 
                    WHERE [images].postid = @postid;
    
                    COMMIT TRANSACTION;
                END TRY
                BEGIN CATCH
                    ROLLBACK TRANSACTION;
                    SELECT ERROR_MESSAGE() AS ErrorMessage;
                END CATCH;
            `;
    
            console.log("Generated SQL Query:", updateQuery); // For debugging purposes
    
            const updatedPost = await request.query(updateQuery);
    
            res.status(200).json({
                message: "Update Post Successfully",
                updatedPost: updatedPost.recordset
            });
        } catch (error) {
            console.error('Error creating post: ', error);
            res.status(500).send('Server error');
        }
    
    
}

/*update [post] 
                                set ${setPostClause.join(" , ")}
                                from [post] inner join [images]
                                on [post].postid = [images].postid 
                                where [post].postid = @postid;

                                update [images]
                                set ${setImgClause.join(" , ")}
                                from [post] inner join [images]
                                on [post].postid = [images].postid 
                                where [images].postid = @postid;*/