const getNearestPoint = (pos, theta, shape) => {
    const u = uvec(theta);
    const t = Math.min(...shape.map(line => (line.c - dot(pos, line.u)) / dot(u, line.u)).map(dist => dist >= 0 ? dist : Number.MAX_VALUE));
    return [add(pos, constmult(u, t)), t];
}

const uvec = (theta) => [Math.cos(theta), Math.sin(theta)];

const square = [
    {type:"Line", u:[1, 0], c:1},
    {type:"Line", u:[1, 0], c:-1},
    {type:"Line", u:[0, 1], c:1},
    {type:"Line", u:[0, 1], c:-1},
]

const constmult = (v, a) => v.map(x => x * a);

const dot = (a, b) => a.length ? a[0] * b[0] + dot(a.slice(1), b.slice(1)) : 0;

const add = (a, b) => a.length ? [a[0] + b[0], ...add(a.slice(1), b.slice(1))] : [];

Array(100).fill().map((_,i) => i / 100 * Math.PI).map(theta => getNearestPoint([0, 0.5], theta, square)).forEach(([p, d]) => console.log(d));