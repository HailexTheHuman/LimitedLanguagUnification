const { exec } = require("child_process");

/*
* the following code is used to install the dependencies for the frontend and backend.
*
* it should be run once before starting the application.
* */

exec("npm i", {"cwd": "./Frontend"}, (err, stdout, stderr) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Frontend: " + stdout);
});

exec("npm i", {"cwd": "./Backend"}, (err, stdout, stderr) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Backend: " + stdout);
});