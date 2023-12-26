import process from 'node:process';

export default class InputBox {
    #current
    /**
     * 
     * @param {string} prompt The text that always appears at the start of the input line
     * @param {(string) => void} fn Callback that handles the input
     */
    constructor(prompt, fn = null) {
        this.prompt = prompt;
        this.#current = '';

        if (!fn)
            throw 'InputBox Callback is required. else the input will be completly ignored. If you really dont care for the input you can just use an anonymous empty function'

        process.stdin.setRawMode(true);
        process.stdin.setEncoding('utf8');
        process.stdout.write(prompt);

        process.stdin.on('data', (key) => {
            switch (key) {
                case '\u001B\u005B\u0041': // up
                case '\u001B\u005B\u0043': // right
                case '\u001B\u005B\u0042': // down
                case '\u001B\u005B\u0044': // left
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\r': { // Enter
                    console.log("\b");
                    process.stdout.write(prompt);
                    const line = this.#current;
                    this.#current = "";
                    fn(line);
                    break;
                }
                case '\u007f': // Backspace
                    process.stdout.write("\r\x1b[K");
                    this.#current = this.#current.slice(0, -1);
                    process.stdout.write(prompt + this.#current);
                    break;
                default:
                    process.stdout.write(key);
                    this.#current += key;
                    break;
            }
        });
    }

    /**
     * 
     * @param {string} str 
     */
    log(str) {
        const totalCurrentLength = this.#current.length + this.prompt.length;
        const lines = Math.ceil(totalCurrentLength / process.stdout.columns);

        for (let i = 0; i < lines; i++) {
            process.stdout.clearLine(0);
            process.stdout.write('\u001B\u005B\u0041');
        }

        process.stdout.write('\u001B\u005B\u0042');
        process.stdout.cursorTo(0);
        console.log(str);
        process.stdout.write(this.prompt + this.#current);
    }
}
