const tasks = Array(10).fill().map(() => ({
    id: Math.random().toString(36).substring(2),
    priority: Math.ceil(Math.random() * 5)
}));

const devs = Array(4).fill().map(() => ({
    name: Array(Math.floor(Math.random() * 10 + 2)).fill().map((_, i) => String.fromCharCode(Math.floor(Math.random() * 26 + 65 + (i === 0 ? 0 : 32)))).join(''),
    currentTasks: [],
}));

const fitness = (c) => c[0];

tasks.sort((a, b) => b.priority - a.priority);

const getCurrentWorkload = (dev) => dev.currentTasks.reduce((p, c) => p + fitness(c[1]), 0);

const stdevSquared = (list) => Math.sqrt(list.reduce((p, c) => p + c ** 2, 0) / list.length - (list.reduce((p, c) => p + c, 0) / list.length) ** 2);

const average = (list) => list.reduce((p, c) => p + c, 0) / list.length;



tasks.forEach(task => {
    bids = devs.map(() => [Math.ceil(Math.random() * 5), Math.ceil(Math.random() * 5)]);
    const currentWorkloads = devs.map(getCurrentWorkload);
    let lowestStdev = Number.MAX_VALUE;
    let lowestI = -1;
    for (let i = 0; i < devs.length; i++) {
        const newWorkloads = [...currentWorkloads];
        newWorkloads[i] += fitness(bids[i]);
        const newStdev = stdevSquared(newWorkloads) * average(newWorkloads);
        if (newStdev < lowestStdev) {
            lowestI = i;
            lowestStdev = newStdev;
        }
    }
    devs[lowestI].currentTasks.push([task, bids[lowestI]]);
    devs.sort(() => Math.random() * 2 - 1);
});

devs.map(dev => {
    dev.totalTasks = dev.currentTasks.length;
    dev.totalWorkload = dev.currentTasks.reduce((p, task) => p + task[1][0], 0);
    dev.totalUnHappiness = dev.currentTasks.reduce((p, task) => p + task[1][1], 0);
    dev.totalFitness = dev.currentTasks.reduce((p, task) => p + fitness(task[1]), 0);

    delete dev.currentTasks;
});

console.log(devs);