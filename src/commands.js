import {join, parse, resolve} from "node:path";
import {access, mkdir, open, readdir, readFile, rename, unlink, writeFile} from "fs/promises";
import {arch, cpus, EOL, homedir, hostname} from "os";
import {createReadStream, createWriteStream} from "fs";
import {createHash} from "crypto";
import {createBrotliCompress, createBrotliDecompress} from "zlib";
import {InvalidInputError} from "./errors.js";


export class Command {
    async exec() {
    }
}

export class CommandUp extends Command {
    async exec(ctx) {
        if (ctx.currentPath !== homedir()) {
            const modifiedPath = join(ctx.currentPath, '..')
            ctx.changeCurrentPath(modifiedPath)
        }
    }
}

export class CommandCd extends Command {
    async exec(ctx, args) {
        if (!args.length) {
            throw new InvalidInputError()
        }

        if (args) {
            await access(resolve(ctx.currentPath, args.join('')))

            ctx.changeCurrentPath(args.join(''))
        }
    }
}

export class CommandLs extends Command {
    async exec(ctx) {
        const files = await readdir(ctx.currentPath, {withFileTypes: true});
        const tableData = Object.entries(files).map(([_idx, file]) => {
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

    }
}

export class CommandCat extends Command {
    async exec(ctx, args) {
        if (!args.length) {
            throw new InvalidInputError()
        }

        const fd = await open(args.join(''), 'r');
        fd.createReadStream().pipe(process.stdout);
    }
}

export class CommandAdd extends Command {
    async exec(ctx, args) {
        if (!args.length) {
            throw new InvalidInputError()
        }

        const parsedPath = parse(args.join(''));

        if (parsedPath.dir) {
            await mkdir(args, {recursive: true});
        }

        await writeFile(args, '', {flag: 'ax+'})

    }
}

export class CommandRn extends Command {
    async exec(ctx, args) {
        if (!args.length) {
            throw new InvalidInputError()
        }

        await rename(...args)

    }
}

export class CommandCp extends Command {
    async exec(ctx, args) {
        if (!args.length) {
            throw new InvalidInputError()
        }

        createReadStream(args[0]).pipe(createWriteStream(args[1], {flags: 'wx'}))

    }
}

export class CommandMv extends Command {
    async exec(ctx, args) {
        if (!args.length) {
            throw new InvalidInputError()
        }

        const readableStream = createReadStream(args[0]);
        readableStream.pipe(createWriteStream(args[1], {flags: 'wx'}))
        readableStream.on('end', () => unlink(args[0]))
    }
}

export class CommandRm extends Command {
    async exec(ctx, args) {
        if (!args.length) {
            throw new InvalidInputError()
        }

        await unlink(args.join(''))
    }
}

export class CommandOs extends Command {
    #parametersExecutorsMap = {
        eol: this.eol,
        cpus: this.cpus,
        homedir: this.homedir,
        username: this.username,
        architecture: this.architecture,
    }

    async exec(ctx, args) {
        if (!args.length) {
            throw new InvalidInputError()
        }

        const arg = args[0].replace('--', '')
        this.#parametersExecutorsMap[arg](arg)
    }

    eol() {
        process.stdout(EOL)
    }

    cpus() {
        process.stdout(cpus())
    }

    homedir() {
        process.stdout(homedir())
    }

    username() {
        process.stdout(hostname())
    }

    architecture() {
        process.stdout(arch())
    }
}

export class CommandHash extends Command {
    async exec(ctx, args) {
        if (!args.length) {
            throw new InvalidInputError()
        }

        const fileBuffer = await readFile(args.join(''));
        const hash = createHash('sha256');
        hash.update(fileBuffer);
        process.stdout(hash.digest('hex'))
    }
}

export class CommandCompress extends Command {
    async exec(ctx, args) {
        if (!args.length) {
            throw new InvalidInputError()
        }

        const brotliCompress = createBrotliCompress();
        const source = createReadStream(args[0]);
        const target = createWriteStream(`${args[1]}.br`);

        source.pipe(brotliCompress).pipe(target)
    }
}

export class CommandDecompress extends Command {
    async exec(ctx, args) {
        if (!args.length) {
            throw new InvalidInputError()
        }

        const brotliDecompress = createBrotliDecompress();
        const source = createReadStream(args[0]);
        const target = createWriteStream(args[1]);

        source.pipe(brotliDecompress).pipe(target)
    }
}

export class CommandExit extends Command {
    async exec(ctx, args) {
        process.emit('SIGINT')
    }
}

export const commandMap = {
    cd: new CommandCd(),
    up: new CommandUp(),
    ls: new CommandLs(),
    cat: new CommandCat(),
    add: new CommandAdd(),
    rn: new CommandRn(),
    cp: new CommandCp(),
    mv: new CommandMv(),
    rm: new CommandRm(),
    os: new CommandOs(),
    hash: new CommandHash(),
    compress: new CommandCompress(),
    decompress: new CommandDecompress(),
    '.exit': new CommandExit()
}
