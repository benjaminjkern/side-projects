const START_BUDGET = 3;
const TARGET = 2 * START_BUDGET;
const BUYIN = 1;
const PROBS = [
    { P: 0.495, W: 1 },
    { P: 0.505, W: -1 },
];

const solved = {};

const estimatedOutcome = (budget, keepGoing = false) => {
    if (budget >= TARGET || budget <= 0) {
        return budget;
    }

    solved[budget] =
        solved[budget] ??
        PROBS.map(({ P, W }) => ({ c: P, v: budget + W * BUYIN }));

    console.log("E(", budget, ") = ", solved[budget]);

    if (typeof solved[budget] === "number") return solved[budget];

    do {
        let outcomeValue = 0;

        const preCalcValues = [...solved[budget]];
        const postCalcValues = [];

        console.log("precalc values", preCalcValues);

        while (preCalcValues.length) {
            const preCalcValue = preCalcValues.pop();
            if (typeof preCalcValue === "number") {
                outcomeValue += preCalcValue;
                continue;
            }
            if (preCalcValue.c === 0) continue;
            const postCalcValue = estimatedOutcome(preCalcValue.v);

            if (typeof postCalcValue === "number") {
                outcomeValue += preCalcValue.c * postCalcValue;
                continue;
            }
            postCalcValues.push(
                ...postCalcValue.map(({ c, v }) => ({
                    c: preCalcValue.c * c,
                    v,
                }))
            );
        }
        console.log("Postcalc values", postCalcValues);

        const postSimplifyValues = [];
        let sameTerm = 0;
        const seenTerm = {};

        for (const term of postCalcValues) {
            if (typeof term === "number") {
                outcomeValue += term;
                continue;
            }
            if (term.v === budget) {
                sameTerm += term.c;
                continue;
            }
            if (seenTerm[term.v]) {
                seenTerm[term.v].c += term.c;
                continue;
            }
            seenTerm[term.v] = { ...term };
            postSimplifyValues.push(seenTerm[term.v]);
        }
        console.log("post simplify values", postSimplifyValues);

        outcomeValue /= 1 - sameTerm;
        const newValues = postSimplifyValues.map(({ c, v }) => ({
            c: c / (1 - sameTerm),
            v,
        }));
        if (newValues.length === 0) {
            solved[budget] = outcomeValue;
            return solved[budget];
        }

        solved[budget] = [outcomeValue, ...newValues];
    }
};

console.log(estimatedOutcome(START_BUDGET, true));
