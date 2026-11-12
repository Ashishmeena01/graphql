
import http from "node:http";
import net from "node:net";
import multer from "multer";
import path from "node:path";





const destination = path.join(import.meta.dirname, "dist");

const storage = multer.diskStorage({
    destination,
    filename: (req, file) => {
        // console.log(req)
        const fname = file + Date.now().toString() + ".zip";
        console.log(`saving the file as ${fname}`);
        return fname;
    }
})

const mt = multer({
    storage,
});


// ---------------- HTTP SERVER ----------------

const server = http.createServer((req, res) => {
    
    const r = mt.single("hero");

    let c = (reqa,resa) => console.log("callback called");

    r(req,res,c);

    let data = [];
    req.on("data", (chunk) => {
        data.push(chunk.toString());
    });
    
    req.on("end", () => {

        const rq = {...req};
        rq.body = data;
        

        

        // console.log("Method:", req.method);
        // console.log("URL:", req.url);
        // console.log("Headers:", req.headers);
        // console.log("length",req.headers["content-length"]);
        // console.log("Body:", body);

        const response = {
            name: "ashish",
            age: 21
        };

        res.statusCode = 201;
        res.setHeader("server", "ashish personal");
        res.setHeader("content-type", "application/json; charset=utf-8");

        res.end(JSON.stringify(response));
    });

    req.on("error", (err) => {
        console.log("Request error:", err.message);
    });
});

server.listen(3000, "localhost", () => {
    console.log("[server2]: listening on port 3000");
});
