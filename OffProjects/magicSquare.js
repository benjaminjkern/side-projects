const isSquare = (n) => {
    const c = n ** (1 / p);
    return Math.abs(c - Math.round(c)) < 1e-10;
}

const p = 4;

const abcdefh = ([g, i, s]) => {
    return [
        -(i ** p) + 2 * s / 3,
        g ** p + i ** p - s / 3,
        -(g ** p) + 2 * s / 3,
        -(g ** p) + i ** p + s / 3,
        s / 3,
        g ** p - i ** p + s / 3,
        -(g ** p) - i ** p + s
    ]
}

const gis = [1, 2, 3];

while (true) {

    const result = abcdefh(gis);
    if (result.every(isSquare)) {
        for (let i = 0; i < 3; i++) {
            if (i < 2) console.log(result.slice(i * 3, (i + 1) * 3));
            else console.log([gis[0] ** p, result[6], gis[1] ** p]);
        }
        console.log(gis[2]);
        if (result.slice(0, 6).every((a, i) => result.slice(i + 1).every(b => b != gis[0] ** p && b != gis[1] ** p && b != a))) console.log("BOOOMOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
    }
    // console.log(gis);

    if (gis[1] - gis[0] <= 2) {
        if (gis[1] + gis[0] === gis[2]) {
            gis[1] = 2;
            gis[2] += 3;
        } else {
            gis[1] = gis[0] + gis[1];
        }
        gis[0] = 1;
    } else {
        gis[0] += 1;
        gis[1] -= 1;
    }
}