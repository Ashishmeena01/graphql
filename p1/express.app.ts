import express from "express";
import { json } from "express";

const app = express();


class AppError extends Error{
    constructor(props) {
        super(props);
    }
    
}


app.use(express.json())

const home = (req,res,next)=>{
    hello()
    // console.log(next("error"));

    let error = req.headers.cookie?.split("=")[0];

    // if(error == "author") throw new Error("something went wrong")
    // else if(error === "authorr") throw new AppError("App Error");

    res.cookie("author","ashish",{
        maxAge:(1000 * 60 * 60 * 24),
        sameSite:true,
    })
    res.cookie("val","name" )
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.end("hi there")
};



function asyncHandler(fn){
    return async (req,res,next)=>{
        try {
            hello();
            await fn(req,res);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}



function hello(){
    throw  "ajfjfkjaslkfjlkakj";
}



app.get("/",home);


app.use((err,req,res,next)=>{
    
    if(err instanceof AppError){
        res.status(err.status)
        res.end(err.message)
        return;
    }

    console.log(err)
    res.status(500);
    res.end("Internal Server Error");
})

app.listen(8080,()=>console.log("listening on the port 8080"));