import {marked} from 'marked';
import oldfs from 'fs';
import fs from 'fs/promises';
import {glob} from 'glob';

async function clear() {
    if (!oldfs.existsSync('docs')) {
        await fs.mkdir('docs');
    }
    const files = await glob('./docs/**/*');
    for (const file of files) {
        await fs.unlink(file);
    }
}

async function main() {
    await clear();

    const files = await glob('./src/docs/**/*.md');
    const standardPage = await fs.readFile('./src/docs/standard-page.html', 'utf8');
    for (const file of files) {
        const markdown = await fs.readFile(file, 'utf8');
        const html = await marked(markdown, {
            mangle: false,
            headerIds: false,
            async: true,
        });

        const replaced = standardPage.replace('</MARKDOWN>', html);
        let new_path = 'docs' + file.substring(8, file.length - 2) + 'html';
        await fs.writeFile(new_path, replaced, 'utf8');
    }
}

main();
