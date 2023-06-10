import {marked} from 'marked';
import oldfs from 'fs';
import fs from 'fs/promises';
import path from 'path';
import {glob} from 'glob';

async function clear() {
    if (!oldfs.existsSync('dist')) {
        await fs.mkdir('dist');
    }
    const files = await glob('./dist/**/*');
    for (const file of files) {
        await fs.unlink(file);
    }
}

async function main() {
    await clear();

    const files = await glob('./docs/**/*.md');
    for (const file of files) {
        const markdown = await fs.readFile(file, 'utf8');
        const html = await marked(markdown, {
            mangle: false,
            headerIds: false,
            async: true,
        });

        let new_path = 'dist' + file.substring(4, file.length - 2) + 'html';
        await fs.writeFile(new_path, html, 'utf8');
    }
}

main();
