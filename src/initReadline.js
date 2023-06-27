import {createInterface} from "node:readline";

export const initReadline = (completer) => {

    return createInterface(process.stdin, process.stdout,  completer);
}
