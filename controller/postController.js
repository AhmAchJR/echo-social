import sql from "mssql"
import dbConnection from "../db/db.js"
import path, { resolve } from 'path'
import { log } from "console"

const db = await dbConnection()

export const getAllPosts = async(req , res)=>{
    try{
    const allPosts = await db.all("select [images].imgurl , [post].* from [post] inner join [images] on [images].postid = [post].postid" , 
        [],
        function(err , rows){
            if(err){
                console.error("Error Selectiong Data:", err)
            }

            return rows
        }
    )
    return res.status(200).json({
        message : "All Posts" , 
        Post : allPosts
    })
    }catch(error){
        console.error('Error Get All post:', error)
        res.status(500).send('Server error')
    }
} 

export const getPostById = async(req , res)=>{
    
    try{

    const postid = Number(req.params.id)
    
    if (isNaN(postid)) {
        return res.status(400).json({ message: 'Invalid post ID' });
    }
    const selectedPost = await db.all(`select [images].imgurl , [post].* from [post] inner join [images] 
                        on [images].postid = [post].postid 
                        where post.postid = $postid` , {
                            $postid : postid 
                        },
                        function(err , row){
                            if(err){
                                console.error("Error Selecting Data:", err)
                            }

                            return row
                        }
                    )
    
    return res.status(200).json({
        message : "Your Post" , 
        post : selectedPost
    })
    }catch (error) {
        console.error('Error Get post:', error)
        res.status(500).send('Server error')
    }
}

export const createPost = async(req , res)=>{

    const {content , visibility} = req.body
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);

    if(!content){
        return res.status(400).send('Content is required')
    }
    const userid = res.locals.userid
    let insertedImgUrls = []
    try{
        const insertedPostId = await db.run("insert into post (userid , content , visibility) values ($userid , $content , $visibility)" , 
            {
                $userid : userid , 
                $content : content , 
                $visibility : visibility 
            } , 
            function (err) {
                if (err) {
                    console.error("Error inserting data:", err)
                }

                // return this.lastID
            }
        )

        if(!insertedPostId){
            console.log("Error Inserting The Post" , insertedPostId)
            
        }

        const imgUrls = req.files.map(file =>{
            return `${file.path}`
        })

        if(imgUrls.length>0){
// stmt: An object representing the prepared SQL statement.
// This is typically empty or contains internal metadata about the execution.
            const imageInsertPromises = imgUrls.map((url)=>{
                const insertImg = `insert into images (postid , imgurl) values($postid , $imgurl)`
                return db.run(insertImg , {$postid : insertedPostId.lastID , $imgurl : url} , 
                    function(error){
                        if(error){
                            console.log("Error Inserting The Img Url" , error)
                        }
                        // return this.lastID
                    }
                )
            })

            insertedImgUrls =  await Promise.all(imageInsertPromises)
            console.log(insertedImgUrls)
        }

        res.status(201)
        .json(
            {message :'Post created successfully' , 
                post : insertedPostId , 
                visibility : visibility,
                content : content, 
                images : insertedImgUrls
            });

    }catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Server error');
    }

}

export const deletePost = async (req , res)=>{
    const postid = Number(req.params.id)
    const userid = res.locals.userid // Assuming you set user id in `res.locals` from middleware

    try {
        // Check if the post exists and belongs to the user
        
        console.log("begin");
        const selectQuery = `select * from post where userid = $userid;`;
        let post = 
            await db.get(selectQuery, { $userid: userid })
        if (!post) {
            return res.status(404).send("Post not found");
        }

        console.log("end");
    
        // Delete the post and associated images
        // db.exec("BEGIN TRANSACTION;")
        const deleteQuery = `DELETE FROM post WHERE postid = $postid`;

        const deletePost = await db.run(deleteQuery, { $postid: postid })

        //db.exec("COMMIT;")
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

        const postid = Number (req.params.id)
        const uploadedFiles = req.files; // Assuming `upload.array('images')` for multiple files
        const newPostObject = req.body
        let {userid} = res.locals
        console.log(newPostObject)
        console.log(userid)

        try {
            
            // Retrieve the post to check ownership 
            const selectedPost = await db.get("select * from post where postid = $postid" , 
                {$postid : postid} )

            console.log(selectedPost)
            
            if (!selectedPost) {
                return res.status(404).send("Post not found");
            }
                
            console.log(selectedPost)
            
            if (res.locals.userid !== selectedPost.userid) {
                return res.status(401).send("Not Your Post");
            }

            if (Object.keys(newPostObject).length === 0 && !uploadedFiles) {
                return res.status(400).send("No fields provided to update");
            }   

            if (Object.keys(newPostObject).length === 0) {
                return res.status(400).send("No fields provided to update");
            }
    
            const arrayFieldsToBeUpdate = Object.keys(newPostObject);
    
            let setPostClause = []
            let setPostParams = []
            let setImgClause = []
            let setImgParams = []
    
            // const sqlTypeMapping = {
            //     content: sql.NVarChar,
            //     visibility: sql.NVarChar,
            //     imgurl: sql.NVarChar
            // };
            
            console.log(arrayFieldsToBeUpdate)
            
            arrayFieldsToBeUpdate.forEach(field => {
                if (newPostObject[field] !== undefined) {
                    setPostClause.push(`${field} = ?`)
                    setPostParams.push(newPostObject[field])
                }
            })

            // Handle image updates
        if (uploadedFiles && uploadedFiles.length > 0) {
            uploadedFiles.forEach(file => {
                // Assume images have a column like `imgurl`
                setImgClause.push('imgurl = ?')
                setImgParams.push(file.path)
            })
        }

            
            console.log(setImgClause)
            console.log(setPostClause)
            let updatedPost = null
            let updatedImg = null

            setPostClause = setPostClause.join(',')
            setImgClause = setImgClause.join(',')
            // let testvar = null
            try {

                await db.run("BEGIN TRANSACTION");
                if (setPostClause.length !== 0) {
                    const query = `update post set ${setPostClause} where postid = ?`;
                    updatedPost = await db.run(query, [...setPostParams, postid])
                    // console.log("updatedPost",updatedPost)
                }
                // console.log("testvar" , testvar)
                
                if (setImgClause.length !== 0) {
                    const query = `update images set ${setImgClause} where postid = ?`;
                    updatedImg =await db.run(query, [...setImgParams, postid])
            } 
                await db.run("COMMIT")

            }catch (error) {
                await db.run("ROLLBACK")
                console.log("Error During Transaction", error)
            }
            //console.log("Generated SQL Query:", updateQuery); // For debugging purposes

            res.status(200).json({
                message: "Update Post Successfully",
                updatedPost: updatedPost , 
                updatedImg : updatedImg
            });
        } catch (error) {
            console.log(userid)
            console.error('Error Updating post: ', error);
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



//  Callback Behavior of db.run()
// In the code snippet, you are using db.run() with a callback function. 
//The callback function does not directly affect the value resolved or returned by db.run(). Instead:
// The callback is executed asynchronously after the db.run() operation completes.
// The value of return inside the callback (e.g., return this.lastID) is local to the callback function. It is not passed to the db.run() caller or promise.

// 2. What db.run() Actually Returns
// If db.run() is used with a callback:
// db.run() itself does not return a meaningful value. 
//It simply starts the query execution and calls the callback when done.
// The value in the callback (this.lastID or this.changes) is not returned or resolved to the caller.
// If db.run() is wrapped in a promise (explicitly or using a Promise-based library like sqlite):
// The promise resolves with an object containing metadata about the execution