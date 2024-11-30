
import dbConnection from "../db/db.js"
const db = await dbConnection()
console.log(db)
// console.dir(db , { showHidden: true, depth: null })


export const createLike = async(req , res)=>{

        try {

            const { postid } = req.params; // Post ID from URL parameters
            const userid = res.locals.userid; // User ID from authenticated session
            
            console.log('Received request:', { 
                postid: req.params.postid, 
                userid: res.locals.userid 
            });
        
            // Validate inputs
            if (!postid || isNaN(postid)) {
                return res.status(400).send('Invalid post ID')
            }
    
        
            // Check if the like already exists
            console.log('DB Instance Methods:', Object.keys(db))
            const checkQuery = `select * from likes where postid = $postid AND userid = $userid`
            const checkResult = await db.get(checkQuery, { $postid: postid, $userid: userid })

            console.log(checkResult)
            
            if (checkResult) {
                return res.status(400).send('Like already exists')
            }
    
            // Insert a new like
            // let insertedLike = null
            const insertQuery = `insert into likes (userid , postid) values (? , ?)`
            const insertedLike = await db.run(insertQuery , [userid , postid])
            res.status(201)
            .json(
                {
                    message :'like Created Successfully' , 
                    like : insertedLike
                })
        } catch (error) {
            console.error('Error creating like:', error);
            res.status(500).send('Server error');
        }
    }

    export const deleteLike = async (req, res) => {
        try {
            const { postid, likeid } = req.params  // Post ID and Like ID from URL parameters
            const userid = res.locals.userid      // User ID from authenticated session
    
            // console.log('Received request:', {
            //     postid: req.params.postid,
            //     likeid: req.params.likeid,
            //     userid: res.locals.userid
            // });
    
            // Validate inputs
            if (!postid || !likeid || isNaN(postid) || isNaN(likeid)) {
                return res.status(400).send('Invalid post ID or like ID')
            }
    
            // Check if the like exists
            const checkQuery = `SELECT * FROM likes WHERE postid = $postid AND likeid = $likeid AND userid = $userid`
            const checkResult = await db.get(checkQuery, { $postid: postid, $likeid: likeid, $userid: userid })
    
            console.log(checkResult)
    
            if (!checkResult) {
                return res.status(404).send('Like not found or you not authorized')
            }
    
            // Delete the like
            const deleteQuery = `DELETE FROM likes WHERE postid = ? AND likeid = ? AND userid = ?`
            const deleteResult = await db.run(deleteQuery, [postid, likeid, userid])
    
            res.status(200).json({
                message: 'Like deleted successfully',
                result: deleteResult
            })
    
        } catch (error) {
            console.error('Error deleting like:', error)
            res.status(500).send('Server error')
        }
    };
    