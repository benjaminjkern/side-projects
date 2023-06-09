const makeAST = require("./makeAST.js");
const fs = require("fs");
const inspect = (object) => require("util").inspect(object, false, null, true);

let fileText;
try {
    fileText = fs.readFileSync(process.argv[process.argv.length - 1]);
} catch (e) {
    fileText = process.argv[process.argv.length - 1];
}

try {
    const Program = makeAST(fileText);
    if (process.argv.length === 3) {
        Program.run();
    } else if (process.argv.length === 4) {
        const language = process.argv[2].slice(1).toLowerCase();
        console.log(Program.gen(language));
    } else {
        console.error(
            "Syntax: node ael-compiler.js [-(language)] program\n\nCurrently supported languages:\n  JavaScript: -js"
        );
        process.exitCode = 1;
    }
} catch (e) {
    console.error(e.message);
    process.exitCode = 2;
}