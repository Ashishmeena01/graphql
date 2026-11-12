
import http from "node:http";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import {json} from "express"

const destination = path.join(import.meta.dirname, "dist");

fs.mkdirSync(destination, { recursive: true });

const storage = multer.diskStorage({
    destination,
    filename: (req, file, cb) => {
        const fname = Date.now() + path.extname(file.originalname);
        cb(null, fname);
    }
});

const mt = multer({ storage });

const upload = mt.single("hero");


const server = http.createServer((req, res) => {

    upload(req, res, (err) => {

        if (err) {
            res.statusCode = 500;
            return res.end("Upload failed");
        }

        

        const middle = json();

        middle(req,res,(err)=>{
            if(err){
                res.statusCode = 500;
                return res.end("something went wrong");
            }

            console.log("File:", req.file);
            console.log("Body:", req.body);

            const response = {
                name: "ashish",
                age: 21,
                uploaded: !!req.file
            };

            res.statusCode = 201;
            res.setHeader("content-type", "application/json");

            res.end(JSON.stringify(response));

        })
    });

});

server.listen(3000, "localhost", () => {
    console.log("Server listening on port 3000");
});
