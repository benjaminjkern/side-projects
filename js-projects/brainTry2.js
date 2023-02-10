const existingFuncs = {};
const existingBrains = {};

const newFuncBlueprint = (name, inputSignature, ...funcs) => {

};

const newBrainBlueprint = (name, nodes) => {

}

const newNode = (blueprintName, ...inputs) => {

}

const newConstant = (value) => {

}

const newRandomBrainBlueprint = (name, numNodes) => {

}

const propagate = (brain, ...inputs) => {
    if (brain.type === 'func') {
        if (brain.inputSignature.length !== inputs.length || inputs.) {
            throw `${brain.name} requires (${inputSignature.join(', ')}) as input but was given (${inputs.map(input => typeof input).join(', ')})!`;
        }
        brain.output = brain.func(...inputs);
        return brain.output;
    }
}