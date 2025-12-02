import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

enum AvaliableCommands {
    echo = 'echo',
    exit = 'exit',
    type = 'type',
}

function SplitInputCommand(commandInput: string) :string[] {
    const index = commandInput.trim().indexOf(' ');
    if (index !== -1)
    {
        return [commandInput.trim().slice(0, index), commandInput.trim().slice(index + 1)];
    }

    return [commandInput.trim()];
}

function run() {

    rl.question('$ ', (command) => {

        if(command.trim() === 'exit') {
            rl.close();
            // console.log("Exited...");
            return;
        }

        const splitCommand = SplitInputCommand(command);

        if (splitCommand.length > 1 && splitCommand[0] === AvaliableCommands.echo) {
            console.log(splitCommand[1]);
        }
        else if (splitCommand.length > 1 && splitCommand[0] === AvaliableCommands.type) {
            if (splitCommand[1] in AvaliableCommands) {
                console.log(`${splitCommand[1]} is a shell builtin`);
            }
            else {
                console.log(`${splitCommand[1]}: command not found`);
            }
        }
        else
        {
            console.log(`${command}: command not found`);
        }

        run();
    });
}

run();