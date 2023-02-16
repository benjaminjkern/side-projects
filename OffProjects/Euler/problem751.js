let theta0 = [2];

const tau = (theta) => {
    const thetaNext = [2];
    let b = concat(theta) - 0;
    let totalLength = 0;
    while (totalLength < 24) {
        const f = Math.floor(b);
        b = f * (b - f + 1);
        thetaNext.push(Math.floor(b));
        totalLength += Math.floor(Math.log10(b)) + 1;
    }
    return thetaNext;
}

const concat = (series, first = true) => {
    if (series.length === 0) return '';
    return series[0] + (first ? '.' : "") + concat(series.slice(1), false);
}

while (true) {
    console.log(concat(tau(theta0)));
    theta0 = tau(theta0);
}
/*
2.223561019313554106173177
2.223561019313554106173177

*/