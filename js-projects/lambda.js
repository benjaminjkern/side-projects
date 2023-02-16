const { inspect } = require("util");

let GLOBAL_CONTEXT = {
    I: { i: "x", o: "x" },
    0: { i: "f", o: { i: "x", o: ["x"] } },
    succ: {
        i: "m",
        o: {
            i: "f",
            o: {
                i: "x",
                o: ["f", ["m", "f", "x"]],
            },
        },
    },
    1: ["succ", "0"],
    double: { i: "x", o: ["x", "x"] },
    k: "k",
};

// should only pass in
const get = (exp, context = {}) => {
    if (typeof exp === "object" && exp.length > 0)
        return exp.map((a) => get(a, context));
    if (exp.i) return {...exp, o: get(exp.o, {...context, [exp.i]: exp.i }) };
    if (context[exp])
        return exp === context[exp] ? exp : get(context[exp], context);
    if (GLOBAL_CONTEXT[exp])
        return exp === GLOBAL_CONTEXT[exp] ?
            exp :
            get(GLOBAL_CONTEXT[exp], context);
    throw new Error(`${exp} doesnt exist in any context!`);
};

const parse = (exp, context = {}) => {
    if (typeof exp === "object" && exp.length >= 2)
        return parse([
            apply(parse(exp[0]), parse(exp[1]), context),
            ...exp.slice(2),
        ]);
    if (typeof exp === "object" && exp.length === 1) return exp[0];
    if (exp.i) return exp;
    return get(exp, context);
};

const apply = (a, b, context = {}) => {
    if (a.i) return get(a.o, {...context, [a.i]: b });
    throw new Error(`${a} is not a lambda object!`);
};

console.log(parse(["succ", "0"]));