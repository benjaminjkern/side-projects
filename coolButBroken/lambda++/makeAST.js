const ohm = require("ohm-js");
const fs = require("fs");

const {
    Program,
    Assignment,
    Print,
    Application,
    Lambda,
    Identifier,
} = require("./node_defs");

const grammar = ohm.grammar(fs.readFileSync("./lpp.ohm"));

const astBuilder = grammar.createSemantics().addOperation("ast", {
    Program(body, _semicolons) {
        return new Program(body.ast());
    },
    Statement_assignment(id, _, exp) {
        return new Assignment(id.sourceString, exp.ast());
    },
    Statement_print(_, expression) {
        return new Print(expression.ast());
    },
    Expression_application(left, right) {
        return new Application(left.ast(), right.ast());
    },
    Expression(exp) {
        return exp.ast();
    },
    Exp2_group(_1, exp, _2) {
        return exp.ast();
    },
    Exp2_lambda(_1, id, _2, exp) {
        return new Lambda(id.sourceString, exp.ast());
    },
    Exp2_bool(_) {
        return new Lambda(
            "x",
            new Lambda(
                "y",
                this.sourceString.toLowerCase() === "true" ?
                new Identifier("x") :
                new Identifier("y")
            )
        );
    },
    Exp2_string(_) {
        return new Identifier(
            this.sourceString.slice(1, this.sourceString.length - 1)
        );
    },
    Exp2_num(_) {
        return new Lambda(
            "f",
            new Lambda(
                "x",
                createNumber(+this.sourceString,
                    new Identifier("f"),
                    new Identifier("x")
                )
            )
        );
    },
    Exp2(exp) {
        return exp.ast();
    },
    id(_1, _2) {
        return new Identifier(this.sourceString);
    },
});

const createNumber = (n, f, x) =>
    n === 0 ? x : new Application(f, createNumber(n - 1, f, x));

const makeAST = (sourceCode) => {
    const match = grammar.match(sourceCode);
    if (!match.succeeded()) throw new Error(match.message);
    return astBuilder(match).ast().analyze();
};

module.exports = makeAST;