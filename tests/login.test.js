
import express from "express"
import request from "supertest"
import loginRoute from "../routes/login.js"
import {describe , it , expect} from "jest"


const app = express()

app.use(express.json())

app.use("/login" , loginRoute)

describe("Test Suite For Test Login" , ()=>{
    it("Post /login/ - failure on invalid post body" , async()=>{

        const {body , statusCode} = await request(app).post("/login/")
        .send({
            login : "" , // testPic
            pass : "123456"
        })

        expect(statusCode).toBe(400)
        expect(1).toEqual(1)
    })
})




// "jest" : {
//       "testPathIgnorePatterns": [
//         "/node_modules/",
//         "/middlewares/",
//         "/images/" , 
//         "/migrations/" , 
//         "/db/" , 
//         "/routes/" , 
//         "/server/" ,
//         "/public" ,  
//         "/views/"
//     ]},