import express from 'express';

function main() {
    const app = express();

    app.use('/', express.static('docs'));
    app.listen(3030);

    console.log('Live at http://localhost:3030')
}

main();
