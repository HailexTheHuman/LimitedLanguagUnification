const { spawn } = require("child_process");

/**
 * this is the child process for the frontend.
 * it runs the frontend in production mode.
 * @type {ChildProcessWithoutNullStreams}
 */
const front = spawn("npm", ["start"], {
    cwd: "./Frontend",
    shell: true
});


/**
 * this is the child process for the backend.
 * it runs the backend in production mode.
 * @type {ChildProcessWithoutNullStreams}
 */
const back = spawn("npm", ["start"], {
    cwd: "./Backend",
    shell: true
});
/*
* the following code is used to log the output of the child processes to the console
* */
back.stdout.on("data", (data) => console.log("Backend: " + data.toString()));
back.stderr.on("data", (data) => console.error("Backend: " + data.toString()));

front.stdout.on("data", (data) => console.log("Frontend: " + data.toString()));
front.stderr.on("data", (data) => console.error("Frontend: " + data.toString()));