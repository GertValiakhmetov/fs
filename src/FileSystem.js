import {homedir} from "os";
import {resolve} from "node:path";
import {InvalidInputError, OperationFailedError} from "./errors.js";

export class Processor {
    #commandExecutor;
    #commandParser;
    #userName;
    currentPath = homedir()

    constructor(commandParser, commandExecutor, userName) {
        this.#commandExecutor = commandExecutor;
        this.#commandParser = commandParser;
        this.#userName = userName
    }

    changeCurrentPath(path){
        if (path) {
            this.currentPath = path
        } else {
            throw new OperationFailedError()
        }
    }

    execCommand(buffer) {
        const context = {
            currentPath: this.currentPath,
            changeCurrentPath: (path) => this.changeCurrentPath(path),
        }
        const parsedCommand = this.#commandParser.parse(buffer);
        try {
            this.#commandExecutor.executeCommand(context, parsedCommand)
            console.log('\x1b[36m%s\x1b[0m', this.currentPath)
        } catch (error) {
            console.log(error.message)
        }
    }
}

export class CommandExecutor {
    #commandMap = [];

    constructor(commandMap) {
        this.#commandMap = commandMap
    }

    executeCommand(ctx, data) {
        const [command, args] = data;
        const commandEntity = this.#commandMap[command];
        const resolveArguments = (args?.args || []).map(arg => resolve(ctx.currentPath, arg))

        try {
            if (commandEntity) {
                commandEntity.exec(ctx, resolveArguments)
            } else {
                throw new InvalidInputError()
            }
        } catch (error) {
            if (error instanceof InvalidInputError) {
                console.log(error.message)
            } else {
                throw new OperationFailedError()
            }
        }
    }
}

export class CommandParser {
    parse(data) {
        const stringData = data.toString();

        // return [command, {args: string[]}]
        return stringData.split(' ').reduce((acc, arg, idx) => {
            if (idx === 0) {
                return [arg.trim()]
            }
            acc[1] = {
                args: [...(acc[1]?.args || []), Boolean(arg) ? arg.trim() : null].filter(Boolean)
            }
            return acc
        }, [])
    }
}



