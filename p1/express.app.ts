import express from "express";


const app = express();


app.get("/",(req,res)=>{


    res.cookie("author","ashish",{
        maxAge:(1000 * 60 * 60 * 24),
        sameSite:true,
    })
    res.cookie("val","name" )

    res.end("hi there")
})

app.listen(8080,()=>console.log("listening on the port 6000"));