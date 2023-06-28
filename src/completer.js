import {parse, resolve, sep} from "node:path";
import {readdir} from "fs/promises";

export const processorCompleter = (processor) => {
    return async (data, callback) => {
        const [command, path] = data.trim().split(' ');
        let suggestions = []

        if (command !== 'cd') {
            callback(null, [suggestions, ''])
            return;
        }

        const resolvedPath = resolve(processor.currentPath, path);
        const parsedPath = parse(resolvedPath)

        const files = await readdir(parsedPath.dir, {withFileTypes: true});
        if (files && files.length) {
            suggestions = files.map(file => {
                if (file.name.toLowerCase().startsWith(parsedPath.base.toLowerCase()) && file.isDirectory()) {
                    return file.name + sep
                }
                return null
            }).filter(Boolean)
        }

        callback(null, [suggestions.map(suggestion => {

            if (parsedPath.dir === processor.currentPath) {
                return suggestion
            }

            return parsedPath.dir.replace(processor.currentPath + sep, '') + sep + suggestion
        }), path])
    }
}
