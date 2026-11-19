class Ashish extends Error {
    
}

try {
    throw new Ashish("hello there is error");
} catch (err) {
    console.log(err);
    // Now prints: Ashish: hello there is error
}