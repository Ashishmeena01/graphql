import express from "express";


const app = express();


app.get("/",(req,res)=>{

    // console.log(req);

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
})

app.listen(8080,()=>console.log("listening on the port 8080"));