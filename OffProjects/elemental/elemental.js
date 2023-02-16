const fs = require('fs');
const prompt = require('prompt-sync')();

const elements = fs.readFileSync('cleanElementData.csv', 'utf-8').split('\n').map(line => line.split(',')).map(([id, name, color, birth, parentA, parentB, owners, comment]) => ({id: id - 0, name, parentA: parentA - 0, parentB: parentB - 0}));


const parseCache = {};
const getParseTree = ({id, name, parentA, parentB}, layers = 0) => {

    if (parseCache[id]) return parseCache[id];
    if (parentA === -1) {
        if (parentB === -1) return name[0];
        throw "This shouldn't have happened!";
    }
    parseCache[id] = "(" + getParseTree(elements[parentA], layers + 1) + getParseTree(elements[parentB], layers + 1) + ")";
    return parseCache[id];
};

const printElement = element => ({name: unescape(element.name), parentA:elements[element.parentA] !== undefined ? unescape(elements[element.parentA].name) : "(root)", parentB:elements[element.parentB] !== undefined ? unescape(elements[element.parentB].name) : "(root)", parseTree: getParseTree(element)});


const allElements = (left, current = "T", forceSize = left.reduce((p,c) => p + c, 0)) => {
    // console.log(current, left)
    if (current.split(/\)|\(|a|e|f|w/g).join("").length > left.reduce((p,c) => p + c, 0)) {
        return [];
    }
    if (current.includes("R")) {
        return [
            ...(left[0] ? allElements([left[0] - 1, left[1], left[2], left[3]], current.replace("R", "a"), forceSize) : []),
            ...(left[1] ? allElements([left[0], left[1] - 1, left[2], left[3]], current.replace("R", "e"), forceSize) : []),
            ...(left[2] ? allElements([left[0], left[1], left[2] - 1, left[3]], current.replace("R", "f"), forceSize) : []),
            ...(left[3] ? allElements([left[0], left[1], left[2], left[3] - 1], current.replace("R", "w"), forceSize) : []),
        ];
    }
    if (current.includes("T")) {
        return [...allElements(left, current.replace("T", "(TT)"), forceSize), ...allElements(left, current.replace("T", "R"), forceSize)];
    }
    if (!forceSize)
        return [current];
    if (current.split(/\)|\(/g).join("").length === forceSize) return [current];
    return [];
}
const combine = (A, B) => {
    if (!A || !B) return undefined;
    for (const element of elements) {
        if ((element.parentA === A.id && element.parentB === B.id) || (element.parentA === B.id && element.parentB === A.id)) {
            return element;
        }
    }
}

const getElement = (string) => {
    // console.log(string);
    if (string[0] !== "(") {
        switch (string[0].toLowerCase()) {
            case "a":
                return elements[0];
            case "e":
                return elements[1];
            case "f":
                return elements[2];
            case "w":
                return elements[3];
        }
        throw "Invalid character";
    }
    if (string[string.length - 1] !== ")") {
        throw "Invalid pattern";
    }

    return combine(...getTwoElements(string.slice(1, string.length - 1)));
}

const getTwoElements = (string) => {
    if (string[0] !== "(") return [getElement(string[0]), getElement(string.slice(1))];
    if (string[string.length - 1] !== ")") return [getElement(string.slice(0,string.length - 1)), getElement(string.slice(string.length - 1))];
    let i = 0;
    for (const c in string) {
        const char = string[c-0];
        if (char === "(") i++;
        if (char === ")") i--;
        if (c-0 !== 0 && i === 0) return [getElement(string.slice(0,(c-0)+1)), getElement(string.slice((c-0)+1))];
    }
    throw "Something went wrong";
}

const uniqueList = (list) => {
    const set = list.reduce((p,c) => ({...p, [c.id]:c}), {});
    return Object.keys(set).map(key => set[key]);
}

const possibilities = (string) => {
    const basicElems = string.split('').reduce((p,c) => {
        switch (c.toLowerCase()) {
            case "a":
                p[0]++;
                break;
            case "e":
                p[1]++;
                break;
            case "f":
                p[2]++;
                break;
            case "w":
                p[3]++;
                break;
        }
        return p;
    },[0,0,0,0]);
    return uniqueList(allElements(basicElems).map(getElement).filter(elem => elem));
}

// while (true) {
//     const output = prompt("Give me all of your basic elements: ");

//     console.log(possibilities(output).map(printElement));
// }

const smallElems = [];

const allPoss = (string = "") => {
    if (string.length === 0) {
        allPoss("a");
        allPoss("e");
        allPoss("f");
        allPoss("w");
        return;
    }
    smallElems.push(...possibilities(string).map(printElement));
    if (string.length >= 6) return;
    switch(string[string.length - 1]) {
        case "a":
            allPoss(string+"a");
        case "e":
            allPoss(string+"e");
        case "f":
            allPoss(string+"f");
        case "w":
            allPoss(string+"w");
    }
}

allPoss();

fs.writeFileSync('parsedElements.csv', smallElems.map(({name, parentA, parentB, parseTree}) => [name, parentA, parentB, parseTree].join(',')).join('\n'));