import connect from 'connect';
import serveStatic from 'serve-static';
import open from 'open';
import path from 'path';
import { spawn } from 'child_process';

enum ProcessArgs {
    MochaHeadlessChrome = '--mocha-headless-chrome'
}

interface Server {
    close: () => void;
}

const server: Server = connect().use(serveStatic(path.join(__dirname, '/..'))).listen(8071, function() {
    if (process.argv.indexOf(ProcessArgs.MochaHeadlessChrome) !== -1) {
        spawn('node_modules/.bin/mocha-headless-chrome', ['-f', 'http://localhost:8071/tests/tests.html'], {
            stdio: 'inherit'
        }).on('exit', function(code: number) {
            server.close();
            process.exit(code);  // eslint-disable-line no-process-exit
        });

    } else {
        open('http://localhost:8071/tests/tests.html');
        console.log('Serving tests...');
    }
});
