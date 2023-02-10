NeuralNet = type: [Int] layerCounts ->
    layers = layerCounts[1..] |> fn: layerCount, i -> Layer layerCounts[i] layerCount
    pass = fn: [Num] input -> reduce layers fn: p, layer -> layer.pass p; resize input (input.length, 1)

initRand = fn: Num range = 1 -> (random() * 2 - 1) * range

Layer = type: Int inputSize, Int outputSize ->
    weights = Tensor(ouptutSize, inputSize) initRand
    bias = Tensor(outputSize, 1) initRand
    nonlinear = fn: $
    pass = fn: Tensor input -> nonlinear (weights * input + bias)

transpose = fn: Tensor a -> a[0] |> fn: _, col -> a |> fn: row -> row[col]

const initRand = (range = 1) => (Math.random() * 2 - 1) * range;

const newLayer = (inputSize, outputSize) => ({
    weights: resize(Array(outputSize * inputSize).fill().map(initRand), outputSize, inputSize),
    bias: resize(Array(outputSize).fill().map(initRand), outputSize, 1),
    pass(input) {
        return matadd(matmult(this.weights, input), this.bias);
    }
});

const transpose = (a) => a[0].map((_, col) => a.map((row) => row[col]));

const resize = (a, ...newSize) => unflatten(flatten(a), ...newSize);

const unflatten = (a, ...newSize) => {
    if (!newSize.length) return a[0];
    if (newSize[0] === 0) return [];
    return [unflatten(a.slice(0, a.length / newSize[0]), ...newSize.slice(1)),
        ...unflatten(a.slice(a.length / newSize[0]), ...newSize.map((x, i) => i === 0 ? x - 1 : x))
    ];
}

const flatten = (a) => {
    if (!a.length) return [a];
    return a.reduce((p, c) => [...p, ...flatten(c)], []);
}

const matadd = (a, b) => {
    if (!a.length && !b.length) return a + b;
    if (a.length == b.length) return a.map((x, i) => matadd(x, b[i]));
    throw "Mismatched size";
}

const matmult = (a, b) => {
    if (!a.length && !b.length) return a * b;
    if (!a.length) return [];
    if (a[0].length == b.length) return [b[0].map((_, bcol) => dotproduct(a[0], b.map(row => row[bcol]))), ...matmult(a.slice(1), b)];
    throw "Mismatched size";
}

const dotproduct = (a, b) => {
    if (a.length == 1 && b.length == 1) return matmult(a[0], b[0]);
    if (a.length == b.length) return matadd(matmult(a[0], b[0]), dotproduct(a.slice(1), b.slice(1)));
    throw "Mismatched size";
}

const zeros = (...sizes) => {
    if (!sizes.length) return 0;
    return Array(sizes[0]).fill().map(() => zeros(...sizes.slice(1)));
}

const size = (a) => {
    if (!a.length) return [];
    return [a.length, ...size(a[0])];
}