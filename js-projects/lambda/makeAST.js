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

const grammar = ohm.grammar(fs.readFileSync("./lambda.ohm"));

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
    Exp2(exp) {
        return exp.ast();
    },
    id(_) {
        return new Identifier(this.sourceString);
    },
});

const makeAST = (sourceCode) => {
    const match = grammar.match(sourceCode);
    if (!match.succeeded()) throw new Error(match.message);
    return astBuilder(match).ast().analyze();
};

module.exports = makeAST;