import {createInterface} from "node:readline";

export const initReadline = (completer, userName) => {
    process.stdin.on('SIGINT', () => console.log(`Thank you for using File Manager, ${userName}, goodbye!`))

    return createInterface(process.stdin, process.stdout,  completer);
}
