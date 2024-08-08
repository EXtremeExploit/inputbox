import process from 'node:process';

export default class InputBox {
    #current
    #position
    /**
     * 
     * @param {string} prompt The text that always appears at the start of the input line
     * @param {(string) => void} fn Callback that handles the input
     */
    constructor(prompt, fn = null) {
        this.prompt = prompt;
        this.#current = '';
        this.#position = 0;

        if (!fn)
            throw 'InputBox Callback is required. else the input will be completly ignored. If you really dont care for the input you can just use an anonymous empty function'

        process.stdin.setRawMode(true);
        process.stdin.setEncoding('utf8');
        process.stdout.write(this.prompt);

        process.stdin.on('data', (key) => {
            switch (key) {
                case '\u001B\u005B\u0041': // up
                    break;
                case '\u001B\u005B\u0043': // right
                    this.#position = Math.min(this.#current.length, this.#position + 1);
                    process.stdout.cursorTo(this.prompt.length + this.#position);
                case '\u001B\u005B\u0042': // down
                    break;
                case '\u001B\u005B\u0044': // left
                    this.#position = Math.max(0, this.#position - 1);
                    process.stdout.cursorTo(this.prompt.length + this.#position);
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\r': { // Enter
                    console.log('\b');
                    const line = this.#current;
                    this.#current = "";
                    this.#position = 0;
                    fn(line);
                    process.stdout.write(this.prompt);
                    break;
                }
                case '\u007f': { // Backspace
                    if (this.#current == '') break;
                    const currentSplit = this.#current.split('');
                    currentSplit.splice(this.#position - 1, 1);
                    this.#current = currentSplit.join('');
                    this.#position--;
                    process.stdout.write("\r\x1b[K");
                    process.stdout.write(this.prompt + this.#current);
                    process.stdout.cursorTo(this.prompt.length + this.#position);
                    break;
                }

                case '\u001B\u005B\u0033\u007e': {// Delete key
                    const currentSplit = this.#current.split('');
                    currentSplit.splice(this.#position, 1);
                    this.#current = currentSplit.join('');
                    process.stdout.write("\r\x1b[K");
                    process.stdout.write(this.prompt + this.#current);
                    process.stdout.cursorTo(this.prompt.length + this.#position);
                    break;
                }
                default:
                    process.stdout.write("\r\x1b[K");
                    this.#current = this.#current.slice(0, this.#position) + key + this.#current.slice(this.#position);
                    this.#position++;
                    process.stdout.write(this.prompt + this.#current);
                    process.stdout.cursorTo(this.prompt.length + this.#position);
                    break;
            }
        });
    }

    setPrompt(newPrompt) {
        this.prompt = newPrompt;
        process.stdout.write("\r\x1b[K");
        process.stdout.write(this.prompt + this.#current);
        process.stdout.cursorTo(this.prompt.length + this.#position);
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
