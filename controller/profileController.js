import dbconnection from '../db/db.js'
import dotenv from 'dotenv'
dotenv.config()
const db = await dbconnection()

export const getProfile = async (req, res) => {

    const userid = Number(req.params.id) || res.locals.userid // Use logged-in user's ID if no ID is provided
    
    // Redirect to the logged-in user's profile if no ID is provided
    if (!userid) {
        return res.status(400).send("User ID not provided.")
    
    }

    console.log("userid from getmyprofile" , userid)
    

    try {
        // Query to select user by ID
        const selectQuery = `
            SELECT userid, email, handle, bio, username, pic 
            FROM users 
            WHERE userid = ?;
        `;

        // Execute the query
        const user = await db.get(selectQuery, [userid]);

        // If user does not exist, return a 404 error
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

           // Send the response with the user data
        // return res.status(200).json({
        //     message: "User",
        //     user: user
        // })

        // Check if the logged-in user is viewing their own profile
        const isOwner = res.locals.userid === userid
        const userRequests = res.locals.userRequests
        const hasIncomingRequest = res.locals.hasIncomingRequest
        // console.log("User requests being passed to EJS:", res.locals.userRequests)
        console.log("hasIncomingRequest being passed to EJS:", hasIncomingRequest)

        // Render the profile page, passing both the user data and ownership status
        return res.render("profile", {
            profile: user,
            token : res.locals.token , 
            userRequests : userRequests ,
            hasIncomingRequest : hasIncomingRequest , 
            isFriend : res.locals.isFriend , 
            isOwner : isOwner ,  // Pass ownership status
            // isFriend: false, // Set example values or dynamically fetch these
            requestSent: false, // Set example values or dynamically fetch these
            // hasIncomingRequest: false // Set example values or dynamically fetch these
        })
    } catch (error) {
        console.error("Error Get User:", error);
        return res.status(500).send("Server error");
    }
}


export const updateMyProfile = async (req , res)=>{

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

export const getUserFriendReqs = async(req , res , next)=>{
    try{

    const userid = res.locals.userid 
    console.log("User ID From getUserFriendReqs : ", userid)
    const selectReqQuery = `select users.* , userRequests.status 
                            from userRequests inner join users
                            on users.userid = userRequests.senderid
                            where receiverid = ?`
    const userRequests = await db.all(selectReqQuery , [userid])
    res.locals.userRequests = userRequests
    userRequests.forEach((row) =>{
        if(row.userid == req.params.id){
            return res.locals.hasIncomingRequest = true            
        }
    })

    console.log("user Requests" , userRequests)
    next()
    }catch(error){
        console.error('GEt User Freinds Requests Error:', error)
        res.status(500).send('Server error')
    }
}

export const getUserFriends = async(req , res , next)=>{
    try{
        const userid = res.locals.userid
        console.log("User ID From getUserFreids" , userid)
        const selectUserFriendsQuery = `select * from userfollows where followedid = ?`
        const followers = await db.all(selectUserFriendsQuery , [userid])
        followers.forEach((row)=>{
            if(row.userid == req.params.id){
                return res.locals.isFriend = true
            }

            return res.locals.isFriend = false
        })
        next()
    }catch(error){
        console.error('GEt User Freinds Error:', error)
        res.status(500).send('Server error')
    }
}

// <!-- <pre><%= JSON.stringify(userRequests) %></pre> Debug: What gets printed here<a href="/profile/<%= request.userid %>">Request from <%= request.handle %> - <%= request.status دي الي كانت عامله مشكلة عدم الظهور لل -->
