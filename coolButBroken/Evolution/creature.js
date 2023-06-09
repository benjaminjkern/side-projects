class Creature {
    constructor(name, pos, nodes, connections) {
        if (connections < nodes - 1) throw `It is impossible to have a connected creature with ${nodes} nodes and ${connections} connections!`;
        this.name = name;

        this.nodes = Array(nodes).fill().map((_, id) => CreatureNode.newRandomNode(this, pos, id));
        this.connections = Array(connections).fill().map(() => {
            const id = Math.floor(Math.random() * this.nodes.length);
            const otherId = Math.floor(Math.random() * this.nodes.length);
            this.nodes[id].addConnection(this.nodes[otherId]);
            this.nodes[otherId].addConnection(this.nodes[id]);
            return { nodes: [id, otherId], t: Math.random() * 10 + 5, c1: Math.random() * 0.1 + 0.1, c0: Math.random() * 0.1 + 0.1 };
        });
        this.originalNodes = this.nodes.map(node => node.constructor);
        this.originalConnections = [...this.connections];
        this.t = 0;
        this.drainRate = 10000;
    }
    draw(ctx) {
        this.connections.forEach(({ nodes }) => {
            if (nodes[0] === nodes[1]) return;
            const connectedNodes = nodes.map(a => this.nodes[a]);
            ctx.beginPath();
            ctx.moveTo(...connectedNodes[0].pos);
            ctx.lineTo(...connectedNodes[1].pos);
            ctx.stroke();
        });
        this.nodes.forEach(node => node.draw(ctx));
    }
    move() {
        this.connections.forEach(({ nodes, t, c1, c0 }, i) => {
            if (nodes[0] === nodes[1]) return;
            const connectedNodes = nodes.map(a => this.nodes[a]);
            const diff = subVec(...connectedNodes.map(node => node.pos));
            const vdiff = subVec(...connectedNodes.map(node => node.v));
            const springlength = Math.sqrt(dotVec(diff, diff));
            const u = diff.map(a => a / springlength);

            const r = springlength - t;
            const dr = dotVec(u, vdiff);
            const ddr = multVec(0.5 * (c1 * dr + c0 * r), u);

            connectedNodes.forEach((node, a) => {
                node.a = node.a.map((ac, i) => ac + (a === 0 ? -1 : 1) * ddr[i]);
            });
        });
        this.nodes.forEach(node => node.move());
    }
    drainEnergy() {
        this.t = (this.t + 1) % this.drainRate;
        if (this.t !== 0) return;
        this.nodes.forEach(node => node.drainEnergy());
        if (this.nodes.every(node => node.dead)) {
            this.nodes.forEach(node => {
                ALLFOOD[Math.random()] = { radius: 7, pos: node.pos };
            })
            delete CREATURES[this.name];
        }
    }
    reproduce(pos, mutate = 0.5) {
        const newName = Math.random();
        const offspring = new Creature(newName, null, 0, 0);

        offspring.originalNodes = this.originalNodes.map(nodeConstruct => {
            if (Math.random() < mutate) return CreatureNode.newRandomNode(null, pos, null).constructor;
            return nodeConstruct;
        });
        if (Math.random() < mutate / 2) {
            offspring.originalNodes.push(CreatureNode.newRandomNode(null, pos, null).constructor);
        }
        if (Math.random() < mutate / 2) {
            const r = Math.floor(Math.random() * offspring.originalNodes.length);
            offspring.originalNodes.splice(r, 1);
        }
        offspring.nodes = offspring.originalNodes.map((nodeConstruct, i) => new nodeConstruct(offspring, pos, i));

        offspring.originalConnections = this.originalConnections.map(({ nodes, t, c1, c0 }) => {
            const newNodes = [...nodes];
            if (Math.random() < mutate / 2 || newNodes[0] >= offspring.originalNodes.length) newNodes[0] = Math.floor(Math.random() * offspring.originalNodes.length);
            if (Math.random() < mutate / 2 || newNodes[1] >= offspring.originalNodes.length) newNodes[1] = Math.floor(Math.random() * offspring.originalNodes.length);

            return { nodes: newNodes, t: Math.max(0, t + Math.random() * 2 - 1), c1: Math.max(0, c1 + 0.01 * (Math.random() * 2 - 1)), c0: Math.max(0, c0 + 0.01 * (Math.random() * 2 - 1)) };
        });
        if (Math.random() < mutate / 2) {
            const id = Math.floor(Math.random() * offspring.nodes.length);
            const otherId = Math.floor(Math.random() * offspring.nodes.length);
            offspring.originalConnections.push({ nodes: [id, otherId], t: Math.random() * 10 + 5, c1: Math.random() * 0.1 + 0.1, c0: Math.random() * 0.1 + 0.1 });
        }
        if (Math.random() < mutate / 2) {
            const r = Math.floor(Math.random() * offspring.originalConnections.length);
            offspring.originalConnections.splice(r, 1);
        }

        offspring.connections = offspring.originalConnections.map((connection) => {
            connection.nodes.forEach((node, i) => {
                offspring.nodes[node].addConnection(offspring.nodes[connection.nodes[1 - i]]);
            });
            return connection;
        });

        CREATURES[newName] = offspring;
    }
}

class CreatureNode {
    constructor(creature, pos, id) {
        this.id = id;
        this.creature = creature;
        this.pos = pos.map(a => a + Math.random() * 2 - 1);
        this.v = [(Math.random() * 2 - 1), (Math.random() * 2 - 1)];
        this.a = [0, 0];
        this.radius = 3;
        this.color = "lightgray";
        this.connectedNodes = [];
    }
    draw(ctx) {
        ctx.fillStyle = this.dead ? "black" : this.color;
        ctx.beginPath();
        ctx.arc(...this.pos, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
    move() {
        this.v = this.v.map((p, i) => 1 * (p + this.a[i]));
        const box = [canvas.width, canvas.height];
        this.pos = this.pos.map((p, i) => p + this.v[i]);
        this.pos.forEach((p, i) => {
            if (p < 0 || p > box[i]) this.v[i] = -this.v[i];
            this.pos[i] = Math.max(0, Math.min(box[i], p));
        });
        this.a = [0, 0];
    }
    addConnection(node) {
        this.connectedNodes.push(node);
    }
    drainEnergy() {
        for (const connectedNode of this.connectedNodes) {
            if (connectedNode instanceof FoodStorageNode && connectedNode.storedFood > 0) {
                connectedNode.storedFood--;
                return;
            }
        }
        this.dead = true;
    }
    static newRandomNode(creature, pos, id) {
        const availableNodes = [EaterNode, MotorNode, CreatureNode, FoodStorageNode];
        const pickedNode = availableNodes[Math.floor(Math.random() * availableNodes.length)];
        return new pickedNode(creature, pos, id);
    }
}

class EaterNode extends CreatureNode {
    constructor(creature, pos, id) {
        super(creature, pos, id);
        this.color = "orange";
    }
    move() {
        super.move();
        if (this.dead) return;
        for (const key in ALLFOOD) {
            const food = ALLFOOD[key];
            const diff = subVec(food.pos, this.pos);
            if (dotVec(diff, diff) < (this.radius + food.radius) ** 2) {
                for (const connectedNode of this.connectedNodes) {
                    if (connectedNode instanceof FoodStorageNode && !connectedNode.dead) {
                        delete ALLFOOD[key];
                        connectedNode.storedFood++;
                        if (connectedNode.storedFood >= this.creature.nodes.length) {
                            connectedNode.storedFood -= this.creature.nodes.length;
                            this.creature.reproduce(connectedNode.pos);
                        }
                        return;
                    }
                }
                return;
            }
        }
    }
}

class MotorNode extends CreatureNode {
    constructor(creature, pos, id) {
        super(creature, pos, id);
        this.color = "blue";
    }
    move() {
        super.move();
        if (this.dead) return;
        this.a = [0.1 * (Math.random() * 2 - 1), 0.1 * (Math.random() * 2 - 1)];
    }
}

class FoodStorageNode extends CreatureNode {
    constructor(creature, pos, id) {
        super(creature, pos, id);
        this.color = "green";
        this.storedFood = 0;
    }
    drainEnergy() {
        if (this.storedFood > 0) {
            this.storedFood--;
        } else {
            super.drainEnergy();
        }
    }
}

class CutNode extends CreatureNode {

}

class GrabNode extends CreatureNode {

}

const addVec = (a, b) => a.map((x, i) => x + b[i]);
const subVec = (a, b) => a.map((x, i) => x - b[i]);
const multVec = (a, v) => v.map(x => x * a);
const dotVec = (a, b) => a.reduce((p, c, i) => p + c * b[i], 0);