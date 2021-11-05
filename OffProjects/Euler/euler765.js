const GLOBAL_MIN = 0;
const GLOBAL_MAX = 1;

class Node {
    min = GLOBAL_MIN;
    max = GLOBAL_MAX;
    parent = undefined;
    children = [];
    update(newChild) {
        console.log("UH");
    }
    updateParent() {
        if (this.parent)
            this.parent.update(this);
    }
    evalOneChild() {
        const child = this.children.pop();
        child.parent = undefined;
        child.evaluate();
        this.update(child);
    }
    evaluate() {
        while (this.children.length && this.min < this.max) {
            this.evalOneChild();
        }
    }
    addChild(child) {
        this.children.push(child);
        child.parent = this;
        this.update(child);
    }
}

class MaxNode extends Node {
    update(newChild) {
        if (newChild.min > this.min) {
            this.min = newChild.min;
            this.updateParent();
        }
    }
    evaluate() {
        super.evaluate();
        this.max = this.min;
    }
}

class MinNode extends Node {
    update(newChild) {
        if (newChild.max < this.max) {
            this.max = newChild.max;
            this.updateParent();
        }
    }
    evaluate() {
        super.evaluate();
        this.min = this.max;
    }
}

class StaticNode extends Node {
    constructor(value) {
        super();
        this.min = value;
        this.max = value;
    }
}

class QNode extends Node {
    runningTotal = 0;
    probs = [];
    update(newChild, i) {
        this.min += newChild.min * p;
        this.max += newChild.max * p;
    }
    updateParent() {
        if (this.parent)
            this.parent.update(this);
    }
    evalOneChild() {
        const child = this.children.pop();
        child.parent = undefined;
        child.evaluate();
        this.update(child);
    }
    evaluate() {
        while (this.children.length && this.min < this.max) {
            this.evalOneChild();
        }
    }
    addChild(child, p) {
        this.children.push(child);
        this.probs.push(p);
        child.parent = this;
        this.update(child, p);
    }
}

const myNode = new MaxNode();
Array(100).fill().map(() => { myNode.addChild(new MinNode()) });

myNode.children.forEach((child) => {
    Array(100).fill().map(() => { child.addChild(new StaticNode(Math.random())) });
});

console.log(myNode);

myNode.evaluate();

console.log(myNode);