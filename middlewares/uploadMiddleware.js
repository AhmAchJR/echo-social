
import multer from "multer"
import path from 'path'
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const profileDest = path.join("/images/profileImages")
const postDest = path.join("/images/postImages")

const profileStorage = multer.diskStorage({             // You define storage configuration
    destination : (req , file , cb)=>{
        cb(null , profileDest)   // Directory for profile images
    } , 

    filename : (req , file , cb)=>{       
         // Create a unique filename with the current timestamp and original name
        // const ext = path.extname(file.originalname); // File extension
        // const filename = `profile-${Date.now()}${ext}`; // Unique filename
        // cb(null, filename);

        cb(null , new Date().toISOString().replace(/:/g , "-") + file.originalname)
        /*
        null means there is no error. It's just a signal to Multer (or any other function) that everything is working as expected.
        profileDest is the second argument, which is the directory where the file will be saved.
        */ 
    }
})

//This is the Multer configuration object where you define how files should be handled.

export const uploadProfileImg = multer({
    storage : profileStorage , 
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif' , "image/jpg"]
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF files are allowed.'));
        }
        cb(null, true)
        // This is the callback function that you use to tell Multer whether the file should be accepted or rejected.
        /*If the file type is not allowed (i.e., it’s not JPEG, PNG, or GIF), you call the callback 
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF files are allowed.')). This will reject the file upload, 
        and Multer will send an error message back to the client.*/
        //If the file type is allowed, you call cb(null, true). The null indicates there is no error, and true means the file is accepted for upload.
        }
    })



export const postStorage = multer.diskStorage({
    destination : (req , file , cb)=>{
        cb(null , postDest)
    } , 
    filename : (req , file , cb)=>{
        const extension = path.extname(file.originalname)
        const imgName = `post-${Date.now()}${extension}`
        cb(null , imgName)
    }
})

export const uploadPostImg = multer({ storage: postStorage })






















/*he multer middleware on the server processes the file upload, 
saving it and making its details available to your route handler.

file Information: After multer processes the file, 
information about the uploaded file is available in req.file. 
You can use this information to store details about the file in your database or perform other operations.

Multer Middleware: The upload.single('profileImage') middleware 
processes the incoming request.
It extracts the file from the form data and saves it to the specified location (e.g., uploads/ directory).

multer processes the uploaded file and saves it to the server.
Your route handler (app.post('/register')) 
receives the request with the file details available in req.file.

*/

/*

You cannot use upload.array() and upload.fields() together in the same middleware configuration 
because each method is designed to handle file uploads in different ways and 
they are mutually exclusive.

upload.array()
Purpose: Handles multiple files from a single form field.
Usage: This method is used when you expect multiple files 
to be uploaded under one specific field name.

upload.fields()
Purpose: Handles multiple files from multiple form fields.
Usage: This method is used when you have multiple fields, 
each potentially containing multiple files.

*/