import {join, resolve} from "node:path";
import {homedir} from "os";
import {readdir} from "fs/promises";

export class Processor {
    #commandExecutor;
    #commandParser;
    #currentPath = homedir()

    constructor(commandParser, commandExecutor) {
        this.#commandExecutor = commandExecutor;
        this.#commandParser = commandParser;
    }

    changeCurrentPath = (path) => {
        if (path) {
            this.#currentPath = path
        } else {
            // TODO: log error
        }
    }

    execCommand(buffer) {
        const context = {
            currentPath: this.#currentPath,
            changeCurrentPath: this.changeCurrentPath
        }
        console.log('\x1b[36m%s\x1b[0m', this.#currentPath)
        const parsedCommand = this.#commandParser.parse(buffer);
        console.log(parsedCommand, 'parsedCommand')
        this.#commandExecutor.executeCommand(context, parsedCommand)
        console.log('\x1b[36m%s\x1b[0m', this.#currentPath)
    }
}

export class CommandExecutor {
    commandMap = {
        cd: new CommandCd(),
        up: new CommandUp(),
        ls: new CommandLs(),
    }

    executeCommand(ctx, data) {
        const [command, args] = data;
        console.log(command, 'command')
        const commandEntity = this.commandMap[command];

        if (commandEntity) {
            commandEntity.exec(ctx, args?.args || {})
        } else {
            // TODO: implement error log
        }
    }
}

export class CommandParser {
    parse(data) {
        const stringData = data.toString();
        return stringData.split(' ').reduce((acc, arg, idx) => {
            if (idx === 0) {
                return [arg.trim()]
            }
            return [...acc, {args: [...(acc.args || []), arg.trim()]}]
        }, [])
    }
}

// commands
export class Command {
    exec() {
    }
}

export class CommandUp extends Command {
    exec(ctx) {
        if (ctx.currentPath !== homedir()) {
            const modifiedPath = join(ctx.currentPath, '..')
            ctx.changeCurrentPath(modifiedPath)
        }
    }
}

export class CommandCd extends Command {
    exec(ctx, args) {
        if (args) {
            const modifiedPath = resolve(ctx.currentPath, ...args);
            ctx.changeCurrentPath(modifiedPath)
        }
    }
}

export class CommandLs extends Command {
    async exec(ctx) {
        try {
            const files = await readdir(ctx.currentPath, {withFileTypes: true});
            const tableData = Object.entries(files).map(([idx, file]) => {
                const isFile = file.isFile();
                const isDirectory = file.isDirectory();
                const name = file.name;
                const type = isFile ? 'file' : 'directory'

                if (isFile || isDirectory) {
                    return {Name: name, Type: type}
                }
                return null
            }).filter(Boolean).sort(({Type}) => Type === 'directory' ? -1 : 1)

            console.table(tableData, ['Name', 'Type'])
        } catch (e) {
            // TODO: log error
        }
    }
}

