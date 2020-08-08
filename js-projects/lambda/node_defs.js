const inspect = (object) =>
    console.log(require("util").inspect(object, false, null, true));

class Program {
    constructor(body) {
        this.body = body;
    }
    analyze() {
        const context = new Set();
        this.body.forEach((statement) => statement.analyze(context));
        return this;
    }
    gen(language) {
        if (language !== "js")
            throw new Error(`I don't know how to compile to ${language}!`);
        const seen = new Set();
        return this.body.map((s) => s.gen(seen, language)).join("\n");
    }
    run() {
        const context = {};
        const names = {};
        this.body.forEach((statement) => statement.run(context, names));
    }
}

class Assignment {
    constructor(id, expression) {
        Object.assign(this, { id, expression });
    }
    analyze(context) {
        if (context.has(this.id))
            throw new Error(`Variable ${this.id} has already been declared!`);
        this.expression.analyze(context);
        context.add(this.id);
    }
    gen(seen, language) {
        if (language !== "js")
            throw new Error(`I don't know how to compile to ${language}!`);
        seen.add(this.id);
        return `let ${isNaN(this.id[0]) ? "" : "_"}${
      this.id
    } = ${this.expression.gen(seen, language)};`;
    }
    run(context, names) {
        context[this.id] = this.expression.run(context, names);
    }
}

class Print {
    constructor(expression) {
        this.expression = expression;
    }
    analyze(context) {
        this.expression.analyze(context);
    }
    gen(seen, language) {
        if (language !== "js")
            throw new Error(`I don't know how to compile to ${language}!`);
        return `console.log(${this.expression.gen(seen, language)});`;
    }
    run(context, names) {
        console.log(this.expression.run(context, names).toString(names));
    }
}

class Application {
    constructor(left, right) {
        Object.assign(this, { left, right });
    }
    analyze(context) {
        this.left.analyze(context);
        this.right.analyze(context);
    }
    gen(seen, language) {
        if (language !== "js")
            throw new Error(`I don't know how to compile to ${language}!`);
        return `${this.left.gen(seen, language)} (${this.right.gen(
      seen,
      language
    )})`;
    }
    run(context, names) {
        let fLeft = this.left;
        let fRight = this.right.run(context, names);
        if (fLeft instanceof Identifier || fLeft instanceof Application)
            fLeft = fLeft.run(context, names);
        if (fLeft instanceof Lambda) {
            return fLeft.expression.run({
                    ...context,
                    [fLeft.variable]: fRight,
                },
                names
            );
        }
        return new Application(fLeft, fRight);
    }
    toString(names) {
        return `(${this.left.toString(names)} ${this.right.toString(names)})`;
    }
}

class Lambda {
    constructor(variable, expression) {
        Object.assign(this, { variable, expression });
    }
    analyze(context) {
        this.expression.analyze(new Set([...context, this.variable]));
    }
    gen(seen, language) {
        if (language !== "js")
            throw new Error(`I don't know how to compile to ${language}!`);
        return `(${isNaN(this.variable[0]) ? "" : "_"}${
      this.variable
    }) => ${this.expression.gen(seen, language)}`;
    }
    run(context, names) {
        const newVariable = getLetter(Object.keys(names).length + 1);
        names[newVariable] = this.variable;
        return new Lambda(
            newVariable,
            this.expression.run({
                    ...context,
                    [this.variable]: new Identifier(newVariable),
                },
                names
            )
        );
    }
    toString(names) {
        return `λ${names[this.variable]}.${this.expression.toString(names)}`;
    }
}

class Identifier {
    constructor(id) {
        this.id = id;
    }
    analyze(context) {
        if (!context.has(this.id))
            throw new Error(`The variable ${this.id} has not been declared!`);
    }
    gen(seen, language) {
        if (language !== "js")
            throw new Error(`I don't know how to compile to ${language}!`);

        return `${isNaN(this.id[0]) ? "" : "_"}${this.id}`;
    }
    run(context) {
        if (context[this.id]) return context[this.id];
        return this;
    }
    toString(names) {
        return names[this.id];
    }
}

// map [0, 1, 2, 3, 4, 5, ... ] to [a, b, c, d, e, f, g, ..., aa, ab, ac, ad, ae, ...]
const getLetter = (num) => {
    if (num === 0) return "";
    return getLetter(Math.floor((num + 9) / 36)) + ((num + 9) % 36).toString(36);
};

module.exports = {
    Program,
    Assignment,
    Print,
    Application,
    Lambda,
    Identifier,
};