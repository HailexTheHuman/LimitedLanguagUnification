const { spawn } = require("child_process");

const front = spawn("npm", ["start"], {
    cwd: "./Frontend",
    shell: true
});



const back = spawn("npm", ["start"], {
    cwd: "./Backend",
    shell: true
});

back.stdout.on("data", (data) => console.log("Backend: " + data.toString()));
back.stderr.on("data", (data) => console.error("Backend: " + data.toString()));

front.stdout.on("data", (data) => console.log("Frontend: " + data.toString()));
front.stderr.on("data", (data) => console.error("Frontend: " + data.toString()));