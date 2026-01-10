type Polynomial = { coefficient: number; products: Record<string, number> }[];
type Expression = { numerator: Polynomial; denominator: Polynomial }; // "Leading" coefficient of denominator should be 1

const makeKey = (products: Record<string, number>) => {
    const variables = Object.keys(products);
    variables.sort();
    return variables.map((v) => `${v}^${products[v]}`).join(",");
};

const keyToProducts = (key: string) => {
    // Note: This will break if variables have ^ or , or maybe numbers in them
    return key.split(",").reduce((p, c) => {
        const [variable, exponent] = c.split("^");
        // Note: This will break if the variable can be 0
        // exponent === undefined => key was empty string (no products)
        if (Number(exponent) === 0 || exponent === undefined) return p;
        return { ...p, [variable]: Number(exponent) };
    }, {});
};

const addPolynomials = (a: Polynomial, b: Polynomial): Polynomial => {
    const sumMap: Record<string, number> = {};
    for (const { coefficient, products } of a) {
        const key = makeKey(products);
        sumMap[key] = (sumMap[key] ?? 0) + coefficient;
    }
    for (const { coefficient, products } of b) {
        const key = makeKey(products);
        sumMap[key] = (sumMap[key] ?? 0) + coefficient;
    }
    return Object.keys(sumMap)
        .map((key) => ({
            coefficient: sumMap[key],
            products: keyToProducts(key),
        }))
        .filter(({ coefficient }) => coefficient !== 0);
};

const multiplyPolynomials = (a: Polynomial, b: Polynomial) => {
    const sumMap: Record<string, number> = {};
    for (const termA of a) {
        for (const termB of b) {
            const newProducts: Record<string, number> = {};
            for (const variable of Object.keys(termA.products)) {
                newProducts[variable] =
                    (newProducts[variable] ?? 0) + termA.products[variable];
            }
            for (const variable of Object.keys(termB.products)) {
                newProducts[variable] =
                    (newProducts[variable] ?? 0) + termA.products[variable];
            }
            const key = makeKey(newProducts);
            sumMap[key] =
                (sumMap[key] ?? 0) + termA.coefficient * termB.coefficient;
        }
    }

    return Object.keys(sumMap)
        .map((key) => ({
            coefficient: sumMap[key],
            products: keyToProducts(key),
        }))
        .filter(({ coefficient }) => coefficient !== 0);
};

const numberToPolynomial = (x: number): Polynomial => [
    { coefficient: x, products: {} },
];
const polynomialToExpression = (x: Polynomial): Expression => ({
    numerator: x,
    denominator: numberToPolynomial(1),
});

const numberToExpression = (x: number): Expression =>
    polynomialToExpression(numberToPolynomial(x));

const getLeadingCoefficient = (x: Polynomial) => {
    const terms = x.map(
        (term) => [makeKey(term.products), term.coefficient] as [string, number]
    );
    terms.sort((a, b) => (a[0] > b[0] ? 1 : 0));
    return terms[0][1];
};

const addExpressions = (a: Expression, b: Expression): Expression => {
    const denominator = multiplyPolynomials(a.denominator, b.denominator);
    const oneOverLeadingCoefficient = numberToPolynomial(
        1 / getLeadingCoefficient(denominator)
    );
    return {
        numerator: multiplyPolynomials(
            addPolynomials(
                multiplyPolynomials(a.numerator, b.denominator),
                multiplyPolynomials(b.numerator, a.denominator)
            ),
            oneOverLeadingCoefficient
        ),
        denominator: multiplyPolynomials(
            denominator,
            oneOverLeadingCoefficient
        ),
    };
};

const multiplyExpressions = (a: Expression, b: Expression): Expression => {
    const denominator = multiplyPolynomials(a.denominator, b.denominator);
    const oneOverLeadingCoefficient = numberToPolynomial(
        1 / getLeadingCoefficient(denominator)
    );
    return {
        numerator: multiplyPolynomials(
            multiplyPolynomials(a.numerator, b.numerator),
            oneOverLeadingCoefficient
        ),
        denominator: multiplyPolynomials(
            denominator,
            oneOverLeadingCoefficient
        ),
    };
};

const subtractExpressions = (a: Expression, b: Expression): Expression => {
    return addExpressions(
        a,
        multiplyExpressions(b, polynomialToExpression(numberToPolynomial(-1)))
    );
};

const expressionsEqual = (a: Expression, b: Expression): boolean => {
    return subtractExpressions(a, b).numerator.length === 0;
};

const divideExpressions = (a: Expression, b: Expression): Expression => {
    return multiplyExpressions(a, {
        numerator: b.denominator,
        denominator: b.numerator,
    });
};
const polynomialToString = (x: Polynomial) => {
    return x
        .filter(({ coefficient }) => coefficient !== 0)
        .map((term) => {
            return `${
                term.coefficient === 1 ? "" : term.coefficient
            }${Object.keys(term.products)
                .map((variable) => `${variable}^${term.products[variable]}`)
                .join()}`;
        })
        .join(" + ");
};

const expressionToString = (x: Expression) => {
    const numeratorString = polynomialToString(x.numerator);
    if (
        expressionsEqual(
            polynomialToExpression(x.denominator),
            numberToExpression(1)
        )
    )
        return numeratorString;
    return `${numeratorString} / ${polynomialToString(x.denominator)}`;
};

const stringToPolynomial = (x: string): Polynomial => {
    const termStrings = x.split("+");
    return termStrings
        .map((termString) => {
            const [coefficientString, ...productStrings] = [
                ...termString.matchAll(/^\s*-?\d+|(?:[a-z]+\^-?\d+)+?/g),
            ].map((match) => match[0]);
            return {
                coefficient: Number(coefficientString),
                products: productStrings.reduce((p, productString) => {
                    const [variable, exponentString] = productString.split("^");
                    if (Number(exponentString) === 0) return p;
                    return { ...p, [variable]: Number(exponentString) };
                }, {}),
            };
        })
        .filter(({ coefficient }) => coefficient !== 0);
};

const stringToExpression = (x: string): Expression => {
    const [numeratorString, denominatorString] = x.split(",");
    const numerator = stringToPolynomial(numeratorString.trim());
    if (!denominatorString)
        return { numerator, denominator: numberToPolynomial(1) };
    const denominator = stringToPolynomial(denominatorString.trim());
    const oneOverLeadingCoefficient = numberToPolynomial(
        1 / getLeadingCoefficient(denominator)
    );
    return {
        numerator: multiplyPolynomials(numerator, oneOverLeadingCoefficient),
        denominator: multiplyPolynomials(
            denominator,
            oneOverLeadingCoefficient
        ),
    };
};

console.log(
    expressionToString(
        addExpressions(numberToExpression(1), numberToExpression(1))
    )
);

console.log(expressionsEqual(numberToExpression(1), numberToExpression(1)));

console.log(stringToExpression("1"));

console.log(stringToExpression("1 / 2"));

console.log(stringToExpression("2x^1"));

console.log(stringToExpression("x^2"));
console.log(stringToExpression("x^2y^1"));
console.log(stringToExpression("5ben^-2 + marissa^3"));
