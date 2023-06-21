import {CommandExecutor, CommandParser, Processor} from "./FileSystem.js";

const processor = new Processor(new CommandParser(), new CommandExecutor());

process.stdin.on('data', (data) => {
    processor.execCommand(data)
})


