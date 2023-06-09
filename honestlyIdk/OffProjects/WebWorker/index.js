class ValueNode {
    greaterThan = [];
    lessThan = null;
    equalTo = [];
    waitingOn = [];
    compsMade = 0;
    parCompsMade = 0;
    constructor(id) {
        this.id = id;
        this.value = Math.floor(Math.random() * 10);
    }

    print() {
        return `${this.value} [${this.greaterThan.map(node => node.print()).join(', ')}]`
    }
}

const NUM_WORKERS = 100;

const allNodes = Array(10000).fill().map((_, i) => new ValueNode(i));

const possibleMatches = [];

const availableWorkers = Array(NUM_WORKERS).fill().map(() => new Worker('worker.js'))

const results = [];

availableWorkers.forEach(worker => {
    worker.onmessage = (e) => {
        const { nodeIds, equal } = e.data;
        results.push([worker, nodeIds, equal]);
    }
    return worker;
});

const doLoop = () => {
    document.getElementById('status').innerHTML = `Available Workers: ${availableWorkers.length}; Matches waiting: ${possibleMatches.length}`;
    // console.log(topNode);
    mostWorkers = Math.max(mostWorkers, NUM_WORKERS - availableWorkers.length);

    // check if no workers are running to pop or stop
    while (topNode.waitingOn.length === 0) {
        if (topNode.greaterThan.length === 0) {
            end = new Date().getTime();
            const avgComps = allNodes.reduce((p, c) => p + c.parCompsMade, 0) / allNodes.length;
            document.getElementById('results').innerHTML += `<br> Time: ${end - start} ms<br>Comparisons: ${totalMatches}<br>Average comparisons per node: ${avgComps}<br>Maximum number of workers used: ${mostWorkers}/${NUM_WORKERS}`;
            return;
        } else if (topNode.greaterThan.length === 1) {
            topNode = topNode.greaterThan.pop();
            const topValues = [topNode.value, ...topNode.equalTo.map(a => a.value)];
            // document.getElementById('results').append(topValues.join(', ') + (topNode.waitingOn.length + topNode.greaterThan.length > 0 ? ', ' : ''));
        } else break;
    }

    while (availableWorkers.length > 0 && possibleMatches.length > 0) {
        const match = possibleMatches.pop();
        // console.log('starting: ', match.map(a => a.print()).join(' : '));
        const worker = availableWorkers.pop();
        match[0].parCompsMade++;
        match[1].parCompsMade++;
        worker.postMessage(match.map(({ id, value }) => [id, value]));
    }

    // deal with previous results
    while (results.length) {
        const [worker, nodeIds, equal] = results.pop();
        const bigNode = allNodes[nodeIds[0]], lilNode = allNodes[nodeIds[1]];
        totalMatches++;

        bigNode.lessThan.waitingOn = bigNode.lessThan.waitingOn.filter(({ id }) => id !== nodeIds[0] && id !== nodeIds[1]);

        // console.log(`${bigNode.print()} ${equal ? '=' : '>'} ${lilNode.print()}`);

        availableWorkers.push(worker);
        // if (equal) {
        //     bigNode.equalTo.push(lilNode, ...lilNode.equalTo);
        //     bigNode.greaterThan.push(...lilNode.greaterThan);
        //     bigNode.waitingOn.push(...lilNode.waitingOn);
        //     lilNode.greaterThan.forEach(node => node.lessThan = bigNode);
        //     lilNode.waitingOn.forEach(node => node.lessThan = bigNode);
        // } else {
        bigNode.greaterThan.push(lilNode);
        lilNode.lessThan = bigNode;
        // }
        bigNode.lessThan.greaterThan.push(bigNode);

        addPossibleMatches(bigNode.lessThan);
        addPossibleMatches(bigNode);
    }

    setTimeout(doLoop, 1);
}

const addPossibleMatches = (node) => {
    while (node.greaterThan.length > 1) {
        const match = [node.greaterThan.pop(), node.greaterThan.pop()];
        node.waitingOn.push(...match);
        possibleMatches.push(match);
    }
}

let comps = 0;
let totalMatches = 0;
let start, end;
let topNode = new ValueNode(null);

let mostWorkers = 0;

window.onload = () => {
    document.getElementById('values').innerHTML = `${allNodes.length} elements`;
    const otherNodes = [...allNodes];
    start = new Date().getTime();
    otherNodes.sort(sortFunc);
    end = new Date().getTime();
    const avgComps = otherNodes.reduce((p, c) => p + c.compsMade, 0) / otherNodes.length;
    document.getElementById('values').innerHTML += `<br> Control time: ${end - start} ms<br>Comparisons: ${comps}<br>Average comparisons per node: ${avgComps}`;

    start = new Date().getTime();

    allNodes.forEach(node => node.lessThan = topNode);
    topNode.greaterThan.push(...allNodes);

    // distribute any available data
    addPossibleMatches(topNode);
    doLoop();
}

const sortFunc = (a, b) => {
    comps++;
    a.compsMade++;
    b.compsMade++;
    // const now = new Date().getTime();
    // while (new Date().getTime() < now + 1);
    return b.value - a.value;
}