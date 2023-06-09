const DEFAULT_MODULES = {
    '+': {
        name: '+', inputs: 2, outputs: 1, fn: ([a, b]) => [a + b],
        constant: true, resources: 1,
    },
    '-': {
        name: '-', inputs: 2, outputs: 1, fn: ([a, b]) => [a - b],
        constant: true, resources: 1,
    },
    '*': {
        name: '*', inputs: 2, outputs: 1, fn: ([a, b]) => [a * b],
        constant: true, resources: 1,
    },
    '/': {
        name: '/', inputs: 2, outputs: 1, fn: ([a, b]) => [a / b],
        constant: true, resources: 1,
    },
    '**': {
        name: '**', inputs: 2, outputs: 1, fn: ([a, b]) => [a ** b],
        constant: true, resources: 1,
    },
    'neg': {
        name: 'neg', inputs: 1, outputs: 1, fn: ([a]) => [-a],
        constant: true, resources: 1,
    },
    '%': {
        name: '%', inputs: 2, outputs: 1, fn: ([a, b]) => [a % b],
        constant: true, resources: 1,
    },
    0: {
        name: 0, inputs: 0, outputs: 1, fn: () => [0], constant: true, resources: 1,
    }
    // 'and': {
    //     name: 'and', inputs: 2, outputs: 1, fn: ([a, b]) => [a & b],
    //     constant: true, resources: 1,
    // },
    // 'or': {
    //     name: 'or', inputs: 2, outputs: 1, fn: ([a, b]) => [a | b],
    //     constant: true, resources: 1,
    // },
    // 'not': {
    //     name: 'not', inputs: 1, outputs: 1, fn: ([a]) => [1 - a],
    //     constant: true, resources: 1,
    // },
    // 'xor': {
    //     name: 'xor',
    //     inputs: 2,
    //     outputs: 1,
    //     outputPtrs: [[0, 0]],
    //     submodules: [
    //         ['or', [[1, 0], [4, 0]]],
    //         ['and', [[-1, 0], [2, 0]]],
    //         ['not', [[-1, 1]]],
    //         ['not', [[-1, 0]]],
    //         ['and', [[-1, 1], [3, 0]]]
    //     ], constant: true
    // }
};

let stillRunning;

const checkStillRunning = (value, first = true) => {
    if (value === stillRunning) {
        if (!first) console.log("Still running: " + stillRunning);
        setTimeout(() => checkStillRunning(value, false), 1000);
    }
}

class ModuleBag {
    constructor() {
        this.modules = { ...DEFAULT_MODULES };
    }

    getInputs(inputs, submodules, pointers) {
        return pointers.map(([modulePtr, inputIdx]) => {
            if (modulePtr === -1) return inputs[inputIdx];
            return submodules[modulePtr].values[inputIdx];
        })
    }

    doOneStep(module, inputs) {
        if (inputs.length !== module.inputs) throw `Module ${module.name} requires ${module.inputs} inputs (Given: ${inputs.length})`;

        // console.log(module);
        if (module.fn) {
            const oldOutputs = module.values;
            module.values = module.fn(inputs);
            return oldOutputs.some((output, i) => output !== module.values[i]);
        }

        if (!module.initiatedModules) module.initiatedModules = module.submodules.map(([submoduleName, submoduleInputs, ...args]) => {
            if (!this.modules[submoduleName]) {
                // console.log(module.submodules);
                throw `Undefined module type: ${submoduleName}`;
            }
            const parentModule = this.modules[submoduleName];
            return { ...parentModule, values: Array(parentModule.outputs).fill(0), inputPtrs: submoduleInputs };
        });

        const oldOutputs = module.values;
        let change = false;
        for (const submodule of module.initiatedModules) {
            if (submodule.inputPtrs) {
                const theseInputs = this.getInputs(inputs, module.initiatedModules, submodule.inputPtrs);
                change = this.doOneStep(submodule, theseInputs) || change;
            }
        }
        module.values = this.getInputs(inputs, module.initiatedModules, module.outputPtrs);
        // console.log(module, change);
        return change || oldOutputs.some((output, i) => output !== module.values[i]);
    }

    runModule(name, inputs, timeout = 100) {
        if (!this.modules[name]) throw `Undefined module type: ${name}`;
        stillRunning = new Date().getTime();
        // checkStillRunning(stillRunning);
        const newModule = { ...this.modules[name], values: Array(this.modules[name].outputs).fill(0) };

        let t = 1;
        while (this.doOneStep(newModule, inputs) && t < timeout) {
            t++;
        }
        // if (t === timeout) console.log(`Module ${name} timed out (Steps given: ${timeout})`);
        // else console.log(`Steps taken: ${t}`);
        return [newModule.values, t];
    }

    defModuleType(name, inputs, outputPtrs, submodules) {
        if (this.modules[name]) throw `There is already a defined module by the name: ${name}`;
        if (inputs < 0) throw `Modules must have at a non-negative number of inputs (Given: ${inputs})`;
        const outputs = outputPtrs.length;
        if (outputs < 1) throw `Modules must have at least one output (Given: ${outputs})`;
        if (submodules.length + inputs === 0) throw `Modules must have at least 1 input or submodule to be able to output anything (${inputs} inputs, ${submodules.length} submodules)`;

        for (const [submoduleName, submoduleInputs] of submodules) {
            if (!this.modules[submoduleName]) throw `Undefined module type: ${submoduleName}`;
            if (this.modules[submoduleName].inputs !== submoduleInputs.length) throw `Invalid submodule: ${submoduleName} requires ${this.modules[submoduleName].inputs} inputs (Given: ${submoduleInputs.length})`;
            for (const [moduleIdx, inputIdx] of submoduleInputs) {
                if (moduleIdx >= submodules.length || moduleIdx < -1) throw `Invalid input pointer: ${moduleIdx} (${submodules.length} submodules in definition, use -1 to point to input array)`;
                if (moduleIdx === -1) {
                    if (inputIdx < 0 || inputIdx >= inputs) throw `Invalid input pointer index: ${inputIdx} (${inputs} total inputs)`;
                    break;
                }
                if (!this.modules[submodules[moduleIdx][0]]) throw `Submodule is trying to point to another submodule with undefined module type: ${submodules[moduleIdx][0]}`;
                if (inputIdx < 0 || inputIdx >= this.modules[submodules[moduleIdx][0]].outputs) throw `Invalid input pointer index: ${inputIdx} (${submodules[moduleIdx][0]} has total outputs)`;
            }
        }

        this.modules[name] = { name, inputs, outputs, outputPtrs, submodules };
    }

    randPointer(inputs, submodules) {
        const moduleIdx = Math.floor(Math.random() * (submodules.length + 1)) - 1;
        if (moduleIdx === -1) return [-1, Math.floor(Math.random() * inputs)];
        // console.log(moduleIdx, submodules[moduleIdx]);
        return [moduleIdx, Math.floor(Math.random() * this.modules[submodules[moduleIdx][0]].outputs)];
    }

    defRandomModule(inputs, outputs, submoduleCount, name) {
        const allModules = Object.keys(this.modules);
        const submodules = Array(submoduleCount).fill().map(() => [allModules[Math.floor(Math.random() * allModules.length)]]);
        this.defModuleType(name || Math.random().toString(36).substring(2), inputs, Array(outputs).fill().map(() => this.randPointer(inputs, submodules)), submodules.map(([moduleType]) => [moduleType, Array(this.modules[moduleType].inputs).fill().map(() => this.randPointer(inputs, submodules))]));
    }

    countResources(name) {
        if (!this.modules[name]) throw `Undefined module type: ${name}`;
        const module = this.modules[name];
        if (module.resources === -1) throw `Circular dependency: ${name}`;

        if (module.resources) return module.resources;
        module.resources = -1;

        module.resources = module.submodules.reduce((p, submodule) => p + this.countResources(submodule[0]), 1) || 1;
        return module.resources;
    }

    isUsedIn(module, submodule) {
        if (module === submodule) return true;
        if (!this.modules[module]) throw `Undefined module type: ${module}`;

        if (!this.modules[module].submodules) return false;

        return this.modules[module].submodules.some(([submoduleName]) => this.isUsedIn(submoduleName, submodule));
    }

    mutateRandomModule() {
        const validModules = Object.keys(this.modules).filter(name => !this.modules[name].constant);
        this.mutateModule(validModules[Math.floor(Math.random() * validModules.length)]);
    }

    mutateModule(name, maxSubmodules = 100, dontpick = {}) {
        if (!this.modules[name]) throw `Undefined module type: ${name}`;
        const module = this.modules[name];
        let choice = Math.floor(Math.random() * 3);
        while (dontpick[choice]) choice = Math.floor(Math.random() * 3);
        switch (choice) {
            case 0:
                // console.log(require('util').inspect(module, false, null, true));
                // console.log("Moving pointer");

                // move a pointer
                const allPointers = [...module.outputPtrs, ...module.submodules.reduce((p, c) => [...p, ...c[1]], [])];
                const newPointer = this.randPointer(module.inputs, module.submodules);
                const r = Math.floor(Math.random() * allPointers.length);
                allPointers[r][0] = newPointer[0];
                allPointers[r][1] = newPointer[1];
                break;
            case 1:
                if (this.countResources(name) >= maxSubmodules) return this.mutateModule(name, maxSubmodules, { ...dontpick, 1: true });

                // console.log(require('util').inspect(module, false, null, true));
                // console.log(this.countResources(name));

                // add new submodule (Assign all randomized necessary pointers)
                let allModules = Object.keys(this.modules).filter(moduleName => {
                    return !this.isUsedIn(moduleName, module.name) && this.countResources(name) + this.countResources(moduleName) <= maxSubmodules;
                });

                newModule: while (allModules.length) {
                    // console.log(allModules);
                    const moduleType = allModules[Math.floor(Math.random() * allModules.length)];
                    module.submodules.push([moduleType]);
                    module.submodules[module.submodules.length - 1].push(Array(this.modules[moduleType].inputs).fill().map(() => this.randPointer(module.inputs, module.submodules)));

                    // Reset module resource counts
                    for (const moduleName in this.modules) {
                        if (this.isUsedIn(moduleName, module.name)) {
                            delete this.modules[moduleName].resources;
                        }
                    }

                    // Verify no module has over the max resources, if so, rollback and remove this module type from the possible list
                    for (const moduleName in this.modules) {
                        if (this.isUsedIn(moduleName, module.name) && this.countResources(moduleName) > maxSubmodules) {
                            module.submodules.pop();
                            allModules = allModules.filter(validModule => validModule !== moduleType);

                            for (const moduleName2 in this.modules) {
                                if (this.isUsedIn(moduleName2, module.name)) {
                                    delete this.modules[moduleName2].resources;
                                }
                            }
                            continue newModule;
                        }
                    }
                    return;
                }
                if (!allModules.length) return this.mutateModule(name, maxSubmodules, { ...dontpick, 1: true });
                break;
            case 2:
                if (module.submodules.length === 0) return this.mutateModule(name, maxSubmodules, { ...dontpick, 2: true });

                // console.log(require('util').inspect(module, false, null, true));
                // console.log("Removing submodule");

                // delete a submodule (and then reassign/shift all related pointers)
                const toDelete = Math.floor(Math.random() * module.submodules.length);
                module.submodules = module.submodules.filter((_, i) => i !== toDelete);
                module.outputPtrs.forEach(([modulePtr, inputIdx], i) => {
                    if (modulePtr < toDelete) return;
                    if (modulePtr === toDelete) module.outputPtrs[i] = this.randPointer(module.inputs, module.submodules);
                    else module.outputPtrs[i][0] = modulePtr - 1;
                });
                module.submodules.forEach(([name, inputPtrs]) => {
                    inputPtrs.forEach(([modulePtr, inputIdx], i) => {
                        if (modulePtr < toDelete) return;
                        if (modulePtr === toDelete) inputPtrs[i] = this.randPointer(module.inputs, module.submodules);
                        else inputPtrs[i][0] = modulePtr - 1;
                    });
                });

                Object.keys(this.modules).forEach(moduleName => { if (this.isUsedIn(moduleName, module.name)) delete this.modules[moduleName].resources });

                break;
        }

        // console.log(require('util').inspect(module, false, null, true));
    }
}

const scramble = (list) => {
    const returnList = [];
    const copyList = [...list];
    for (let i = 0; i < list.length; i++) {
        const r = Math.floor(Math.random() * copyList.length);
        const toAdd = copyList.splice(r, 1);
        returnList.push(...toAdd);
    }
    return returnList;
}

// const target = new ModuleBag();

// target.defModuleType('xor', 2, [[3, 0]], [['and', [[-1, 0], [-1, 1]]], ['or', [[-1, 0], [-1, 1]]], ['not', [[0, 0]]], ['and', [[1, 0], [2, 0]]]]);

// mod.defModuleType('halfadd', 2, [[0, 0], [1, 0]], [['xor', [[-1, 0], [-1, 1]]], ['and', [[-1, 0], [-1, 1]]]]);

// mod.defModuleType('fulladd', 3, [[0, 0], [1, 0]], [['xor', [[3, 0], [-1, 2]]], ['or', [[3, 1], [2, 0]]], ['and', [[3, 0], [-1, 2]]], ['halfadd', [[-1, 0], [-1, 1]]]]);

// mod.defModuleType('add4', 8)

// target.defRandomModule(10, 10, 100, 'jeff');

const testBags = (bags, inputLength, targetFunc, moduleName, numToTest) => {

    const errors = bags.map(() => 0);
    const steps = bags.map(() => 0);
    const times = bags.map(() => 0);

    for (let i = 0; i < numToTest; i++) {
        const randomInput = Array(inputLength).fill().map(generateRandomInput);
        const targetOutput = targetFunc(randomInput);
        for (const [j, toTest] of bags.entries()) {
            const start = new Date().getTime();
            const result = toTest.runModule(moduleName, randomInput);
            const end = new Date().getTime();

            errors[j] += result[0].reduce((p, c, i) => p + ((c - targetOutput[i]) ** 2) / numToTest, 0);
            steps[j] += result[1] / numToTest;
            times[j] += end - start;
        }
    }
    for (const [j, toTest] of bags.entries()) {
        toTest.score = [errors[j], steps[j], toTest.countResources(moduleName), times[j]];
    }
}

const deepCopy = (obj) => {
    if (typeof obj !== 'object') return obj;
    if (obj.length !== undefined) return obj.map(deepCopy);
    return Object.keys(obj).reduce((p, key) => ({ ...p, [key]: deepCopy(obj[key]) }), {});
}

const N = 11;
const numToTest = 10;
const moduleNameToTest = 'penis';
const inputOutput = [1, 1];
const compareFunc = ([x]) => [x ** 3];
const generateRandomInput = () => Math.random() * 10 - 5;

const maxModules = 10;
const newModuleRate = 0.1;
const newModuleInputMax = 4;
const newModuleOutputMax = 4;


let randoms = Array(N).fill().map(() => {
    const mod = new ModuleBag();
    mod.defRandomModule(...inputOutput, 0, moduleNameToTest);
    return mod;
});
console.log('Generation,Best,Median,Worst')

let generation = 0;
while (true) {

    randoms = scramble(randoms);

    testBags(randoms, inputOutput[0], compareFunc, moduleNameToTest, numToTest);

    randoms.sort((a, b) => {
        if (a.score[0] < 1e-15 && b.score[0] < 1e-15) {
            for (let i = 0; i < a.score.length; i++) {
                if (a.score[i] === b.score[i]) continue;
                if (Number.isNaN(a.score[i]) && Number.isNaN(b.score[i])) continue;
                if (Number.isNaN(a.score[i]) && !Number.isNaN(b.score[i])) return 1;
                if (!Number.isNaN(a.score[i]) && Number.isNaN(b.score[i])) return -1;
                return a.score[i] - b.score[i];
            }
            return 0;
        }
        if (Number.isNaN(a.score[0]) && Number.isNaN(b.score[0])) return 0;
        if (Number.isNaN(a.score[0]) && !Number.isNaN(b.score[0])) return 1;
        if (!Number.isNaN(a.score[0]) && Number.isNaN(b.score[0])) return -1;
        return a.score[0] - b.score[0];
    });
    console.log(generation, randoms[0].score, randoms[Math.floor(N / 2)].score, randoms[N - 1].score);
    // console.log(`  Best: ${randoms[0].score}`);
    // console.log(`  Median: ${(randoms[N / 2].score + randoms[N / 2 - 1].score) / 2}`);
    // console.log(`  Worst: ${randoms[N - 1].score}`);

    randoms.slice(Math.floor(N / 2)).forEach((mod, i) => {
        mod.modules = deepCopy(randoms[i].modules);
        if (Math.random() < newModuleRate && Object.keys(mod.modules).length < maxModules) {
            mod.defRandomModule(Math.ceil(Math.random() * newModuleInputMax), Math.ceil(Math.random() * newModuleOutputMax), 0);
        } else {
            mod.mutateRandomModule();
        }
        // console.log("---------------------------------------------------------");
    });

    // end of the line gets to restart from beginning
    randoms[N - 1] = new ModuleBag();
    randoms[N - 1].defRandomModule(...inputOutput, 0, moduleNameToTest);

    generation++;

    if (generation % 100 === 0)
        console.log(require('util').inspect(randoms[0].modules[moduleNameToTest], false, null, true));
}

console.log(require('util').inspect(randoms[0].modules, false, null, true));