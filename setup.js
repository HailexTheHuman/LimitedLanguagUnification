const { exec } = require("child_process");

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