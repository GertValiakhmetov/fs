import {CommandExecutor, CommandParser, Processor} from "./FileSystem.js";
import {initReadline} from "./initReadline.js";
import {processorCompleter} from "./completer.js";
import {commandMap} from "./commands.js";

const args = process.argv;

const userName = args[args.length - 1].replace('--username=', '')

console.log(`Welcome to the File Manager, ${userName}`)

const processor = new Processor(new CommandParser(), new CommandExecutor(commandMap), userName);

const readline = initReadline(processorCompleter(processor), userName)

readline.on("line", data => {
    processor.execCommand(data)
})

