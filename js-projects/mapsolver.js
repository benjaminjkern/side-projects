const max = 46;

let best = 4 * max;

let nodes;


const printNodes = () => {
    let minX = 0,
        maxX = 0,
        minY = 0,
        maxY = 0;
    for (let key in nodes) {
        const node = key.split(',').map(a => a - 0);
        if (node[0] < minX) minX = node[0];
        if (node[0] > maxX) maxX = node[0];
        if (node[1] < minY) minY = node[1];
        if (node[1] > maxY) maxY = node[1];
    }

    let printString = "";
    for (let y = minY; y <= maxY; y++) {
        printString += "\n";
        for (let x = minX; x <= maxX; x++) {
            printString += nodes[`${x},${y}`] ? 'X' : ' ';
        }
    }
    console.log(printString);
}

while (true) {
    nodes = { '0,0': true };
    let count = 4;

    while (Object.keys(nodes).length < max) {
        const pickNode = Object.keys(nodes)[Math.floor(Math.random() * Object.keys(nodes).length)].split(',').map(a => a - 0);
        pickNode[Math.round(Math.random())] += Math.round(Math.random()) * 2 - 1;

        const key = pickNode.join(',');
        if (nodes[key]) continue;

        nodes[key] = true;
        if (!nodes[`${pickNode[0] + 1},${pickNode[1]}`]) count++;
        if (!nodes[`${pickNode[0] - 1},${pickNode[1]}`]) count++;
        if (!nodes[`${pickNode[0]},${pickNode[1] + 1}`]) count++;
        if (!nodes[`${pickNode[0]},${pickNode[1] - 1}`]) count++;
    }
    if (count < best) {
        console.log(count);
        printNodes();
        best = count;
    }
}