import net from "net"

// ---------------- TCP SERVER ----------------

const s = net.createServer((sock) => {
    console.log("Client connected");

    let data = [];

    sock.on("data", (chunk) => {
        data.push(chunk);
        console.log("Received:", chunk.toString());
    });

    sock.on("end", () => {
        console.log("Client ended its writable side");
        console.log("Complete data:", Buffer.concat(data).toString());
    });

    sock.on("close", () => {
        console.log("Socket fully closed");
    });

    sock.on("error", (err) => {
        console.log("Socket error:", err.message);
    });

    sock.write("hello client");
});

s.on("connection", (sock) => {
    console.log("New TCP connection established");
});

s.on("close", () => {
    console.log("TCP server closed");
});

s.on("error", (err) => {
    console.log("TCP server error:", err.message);
});

s.listen(4000, () => {
    console.log("[server]: listening on port 4000");
});
