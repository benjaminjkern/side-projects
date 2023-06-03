window.onload = fn:
    # This is allowed because canvas is already initialized by the time ctx comes around
    canvas, ctx = document.getElementById('canvas'), canvas.getContext('2d')

    # this is allowed because of the way tuples work
    canvas.(width, height) = window.(innerWidth, innerHeight)

    init()
    startLoop()

window.onresize = fn:
    canvas.(width, height) = window.(innerWidth, innerHeight)
    draw()

window.oncontextmenu = fn: false

startLoop = fn:
    repeat:
        update()
        sleep (1000 / fps)


# Need to change comments to look for at least 1 non-# character in between blocks of #'s to denote the end of a multiline big comment
##########################
DEFAULT CONFIGURATION
##########################

fps = 60

##########################
THE REST
##########################

# Maybe try to figure out tuples - points - vectors ???
G = (0, 1)
SELECT_RADIUS = 10
EPSILON = 1e-15
MAX_COUNT = 1000

running = false
drawing = false
usingGrid = false
mouse = (0, 0)

Node = type: hash = fn: this.id

init = fn:
    if usingGrid:
        MAX = (201, 25), margin = 400

        for cross([0..XMAX), [0..YMAX)): x, y ->
            newNode = Node:
                id = nodes.length
                pos = margin + $ * (canvas.(width, height) - 2 * margin) / (MAX - 1)
                connections = []
                locked = y == 0 and (x == 0 or x == XMAX - 1 or x % 4 == 0)

            if y != 0: newNode.connections ++= newNode.id - 1
            if y != YMAX - 1: newNode.connections ++= newNode.id + 1
            if x != 0: newNode.connections ++= newNode.id - YMAX
            if x != XMAX - 1: newNode.connections ++= newNode.id + YMAX

update = fn:
    if running:
        for Node.all: node ->
            node.oPos = node.pos
            if !node.locked:
                node.v += G
                node.pos += node.v
        
        goAgain = true
        repeat MAX_COUNT:
            if !goAgain: break
            goAgain = false
            
            for Node.all: node ->
                if node.locked or node.connections.empty:
                    node.newPos = node.pos
                    continue
                possibleNewSpots = node.connections |> fn: connection, i -> setVecToDist(Node.all[connection], node.pos, node.distances[i])
                node.newPos = (sum possibleNewSpots) / node.connections.length

            # This can probably be optimized
            for Node.all: node ->
                if vecDist(node.newPos, node.pos) > EPSILON: goAgain = true
                node.pos = node.newPos
            
        for Node.all: node ->
            node.v = node.pos - node.oPos

    draw()

draw = fn:
    ctx.clearRect(0, 0, ...canvas.(width, height))
    if moving:
        ctx.fillRect(...(canvas.(width, height) - 50), ...canvas.(width, height), '#ff000044')
    if preSelectedNode:
        ctx.fillCircle(...canvas.pos, selectRadius, '#ff000044')
    if selectedNode:
        ctx.fillCircle(...canvas.pos, selectRadius, '#ff000088')
        ctx.moveTo selectedNode.pos
        ctx.lineTo mouse

    for Node.all: node ->
        ctx.drawCircle(...canvas.pos, 2, node.locked ? 'red', 'black')

        for node.connections: connection | connection < node.id ->
            ctx.moveTo(...node.pos)
            ctx.lineTo(...Node.all[connection].pos)
fn:
print('hello')

window.onmousedown = fn: e ->
    rightNow = DateTime.getTime()
    if preSelectedNode exists:
        dragging = preSelectedNode
        # There are a few ways of doing this, this might be considered the most "Cuttly" ??
        asyncDelayRun
            fn:
                if lastUp < rightNow:
                    moving = dragging
                    delete preSelectedNode, selectedNode
            300

        ### This is probably the grossest one, I'm honestly not sure if this should count
        asyncDelayRun (fn: if lastUp < rightNow:
            moving = dragging
            delete preSelectedNode, selectedNode)
            300

        asyncDelayRun(fn: if lastUp < rightNow { moving = dragging; delete preSelectedNode, selectedNode; }, 300)

    lastDown = rightNow

window.onmouseup = fn: e ?= window.event ->
    if 'which' in e:
        isRightMB = e.which == 3
    else if 'button' in e:
        isRightMB = e.button == 2
    
    lastUp = DateTime.getTime()

    if moving:
        if moving.pos > canvas.(width, height) - 50:
            for Node.all: node ->
                node.connections -= fn: connection -> connection == moving.id
            
            delete Node.all[moving.id]

        delete moving
        return

    if (selectedNode, preSelectedNode) exists:
        if selectedNode != preSelectedNode:
            if preSelectedNode.id in selectedNode.connections:
                selectedNode.connections ++= preSelectedNode.id


#######################################

window.onmouseup = (e) => {
    // figure out if right click
    let isRightMB;
    e = e || window.event;
    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3;
    else if ("button" in e)  // IE, Opera 
        isRightMB = e.button == 2;

    lastUp = new Date().getTime();

    if (moving) {
        if (moving.pos[0] > canvas.width - 50 && moving.pos[1] > canvas.height - 50) {
            for (const node of safeNodes()) {
                node.connections = node.connections.filter(connection => connection !== moving.id);
            }
            nodes[moving.id] = undefined;
        }
        moving = undefined;
        return;
    }

    if (selectedNode && preSelectedNode) {
        if (selectedNode != preSelectedNode) {
            if (!selectedNode.connections.includes(preSelectedNode.id)) {
                selectedNode.connections.push(preSelectedNode.id);
                preSelectedNode.connections.push(selectedNode.id);
            } else {
                selectedNode.connections = selectedNode.connections.filter(connection => connection !== preSelectedNode.id);
                preSelectedNode.connections = preSelectedNode.connections.filter(connection => connection !== selectedNode.id);
            }
        } else {
            selectedNode.locked = !selectedNode.locked;
        }
        selectedNode = undefined;
    } else if (selectedNode && !preSelectedNode) {
        const newId = getNewId();
        selectedNode.connections.push(newId);
        nodes[newId] = { id: newId, pos: [e.x, e.y], v: [0, 0], connections: [selectedNode.id] };
        if (!isRightMB) selectedNode = undefined;
        else selectedNode = nodes[newId];
        preSelectedNode = nodes[newId];
    } else if (preSelectedNode) {
        selectedNode = preSelectedNode;
    } else {
        const newId = getNewId();
        nodes[newId] = { id: newId, pos: [e.x, e.y], v: [0, 0], connections: [] };
        preSelectedNode = nodes[newId];
    }
}

const getNewId = () => {
    for (const [i, node] of nodes.entries()) {
        if (node === undefined) return i;
    }
    return nodes.length;
}

window.onmousemove = (e) => {
    mouse = [e.x, e.y];
    if (moving) {
        moving.pos = mouse;
        return;
    }
    for (const node of safeNodes()) {
        if (!node.locked && running) continue;
        if (vecDist(mouse, node.pos) < selectRadius) {
            preSelectedNode = node;
            return;
        }
    }
    preSelectedNode = undefined;
}

window.onkeydown = () => {
    running = !running;
    if (running) {
        for (const node of safeNodes()) {
            node.v = [0, 0];
            node.distances = node.connections.map(connection => vecDist(node.pos, nodes[connection].pos));
        }
    }
}

const addVec = (a, b) => {
    if (a.length !== b.length) throw "Mismatched vectors!";
    return a.map((ax, i) => ax + b[i]);
}

const multConstVec = (a, v) => {
    return v.map(x => x * a);
}

const vecDist = (a, b) => {
    return Math.sqrt(a.reduce((p, ax, i) => p + (ax - b[i]) ** 2, 0));
}

const setVecToDist = (a, b, d) => {
    const s = d / vecDist(a, b);
    return addVec(multConstVec(1 - s, a), multConstVec(s, b));
}

const setVecBothWaysToDist = (a, b, d) => {
    const s = vecDist(a, b);
    const sMinus = (1 - d / s) / 2;
    const sPlus = (1 + d / s) / 2;
    return [addVec(multConstVec(sPlus, a), multConstVec(sMinus, b)), addVec(multConstVec(sMinus, a), multConstVec(sPlus, b))];
}

const subVec = (a, b) => {
    if (a.length !== b.length) throw "Mismatched vectors!";
    return a.map((ax, i) => ax - b[i]);
}