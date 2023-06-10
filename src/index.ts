import { marked } from 'marked';
import oldfs from 'fs';
import fs from 'fs/promises';
import { glob } from 'glob';
import Handlebars from 'handlebars';

interface MarkdownDocument {
    renderedHtml: string;
    name: string;
    major: number;
    minor: number | undefined;
    url: string;
}

async function clear() {
    if (!oldfs.existsSync('docs')) {
        await fs.mkdir('docs');
    }
    const files = await glob('./docs/**/*');
    for (const file of files) {
        await fs.unlink(file);
    }
}

async function renderMarkdown(): Promise<MarkdownDocument[]> {
    const metadataRegex = /---\n(.*?)\n---/m;

    const files = await glob('./src/docs/**/*.md');
    const documents = [];
    for (const file of files) {
        const rawText = await fs.readFile(file, 'utf8');

        let renderableStart;
        if (rawText.startsWith('---')) {
            renderableStart = rawText.lastIndexOf('---') + 3;
        } else {
            renderableStart = 0;
        }

        const renderable = rawText.substring(renderableStart).trim();
        const renderedHtml = await marked(renderable, {
            mangle: false,
            headerIds: false,
            async: true,
        });

        const metadata = metadataRegex.exec(rawText);

        if (metadata == null) {
            throw Error('missing metadata for ' + file);
        }

        const jsonText = metadata[1];
        const json = JSON.parse(jsonText);
        let url = file.substring(8, file.length - 3);

        documents.push({
            ...json,
            renderedHtml,
            url,
        });
    }

    return documents;
}

interface SidebarPage {
    url: string;
    section: string;
    name: string;
}

async function main() {
    await clear();

    const markdownPages = await renderMarkdown();
    markdownPages.sort((a, b) => {
        if (a.major > b.major) {
            return 1;
        } else if (a.major < b.major) {
            return -1;
        } else if ((a.minor ?? -1) > (b.minor ?? -1)) {
            return 1;
        } else if ((a.minor ?? -1) < (b.minor ?? -1)) {
            return -1;
        } else {
            return 0;
        }
    });

    const sidebarPages: SidebarPage[] = [];
    for (const markdownPage of markdownPages) {
        const section = markdownPage.major + '.' + (markdownPage.minor?.toString() ?? '');

        sidebarPages.push({
            name: markdownPage.name,
            section,
            url: markdownPage.url
        });
    }

    const rawTemplate = await fs.readFile('./src/docs/standard-page.html', 'utf8');
    const template = Handlebars.compile(rawTemplate);
    for (const markdownPage of markdownPages) {
        const compiled = template({
            markdown: markdownPage.renderedHtml,
            pages: sidebarPages,
        });

        let new_path = 'docs' + markdownPage.url + '.html';
        await fs.writeFile(new_path, compiled, 'utf8');
    }

    await fs.writeFile('docs/CNAME', 'keid.dev', 'utf8');
}

main();
