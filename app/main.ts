import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function run() {

    rl.question('$ ', (command) => {

        if(true)
        {
            console.log(`${command}: command not found`);
        }

        if(command === 'exit') {
            rl.close();
            console.log("Exited...");
            return;
        }

        run();
    });
}

run();