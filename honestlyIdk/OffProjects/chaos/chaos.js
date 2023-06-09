const infiniteApplication = (f, maxRecurse = -1, returnMultiple = true) => {
    let seen;
    let order;
    let i;

    const recurse = (x) => {
        if (seen[x] !== undefined)
            return { order: order.slice(seen[x]), stepsBeforeOrder: i };
        seen[x] = i;
        order.push(x);
        i++;
        if (maxRecurse !== -1 && i > maxRecurse) return "Max recursion reached";
        try {
            return recurse(f(x));
        } catch (e) {
            return "Max recursion reached by system";
        }
    };
    return (x) => {
        seen = {};
        order = [];
        i = 0;
        return recurse(x);
    };
};

const g = (c) => infiniteApplication((z) => compAdd(compMult(z, z), c), -1)(0);

const range = (...args) => {
    if (args.length === 1)
        return Array(args[0])
            .fill()
            .map((_, i) => i);
    if (args.length === 2)
        return Array(Math.ceil(args[1] - args[0]))
            .fill()
            .map((_, i) => i + args[0]);
    if (args.length >= 3)
        return Array(Math.ceil((args[2] - args[0]) / args[1]))
            .fill()
            .map((_, i) => i * args[1] + args[0]);
};

console.log(g(0.24));

// range(-1.5, 0.01, 1.5).forEach((x) => console.log(x, g(x)));

// console.log(g(1));
