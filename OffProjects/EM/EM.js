const dot = (a, b) => a.reduce((p, c, i) => p + c * b[i], 0);

const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
];

const vecLength = (v) => Math.sqrt(dot(v, v));

const GRIDSIZE = [100, 100, 1];
const DX = [0.1, 0.1, 0.1];
const MINS = [0, 0, 0];
const DT = 0.0000001;
const boundaries = ([x, y, z]) => 0;

const MU = 1.25663706212e-6;
const EPSILON = 8.8541878128e-12;
// const EPSILON = 1;

const fieldSize = GRIDSIZE.reduce((p, c) => p * c, 1);

const E = Array(fieldSize);
const B = Array(fieldSize);
const v = Array(fieldSize);
const rho = Array(fieldSize);

const rho_c = Array(fieldSize);

let max_rho;

const dE = Array(fieldSize);
const dB = Array(fieldSize);
const dv = Array(fieldSize);
const drho = Array(fieldSize);

const init = () => {
    const k = 1 / 4 / Math.PI / EPSILON;

    let center = [Math.random() * GRIDSIZE[0], Math.random() * GRIDSIZE[1]];
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let z = 0; z < GRIDSIZE[2]; z++) {
                const index = makeIdx(x, y, z);
                let diff = [x - center[0], y - center[1]];
                let dist = vecLength(diff);

                E[index] = [k * diff[0] / dist, k * diff[1] / dist, 0];
                B[index] = [0, 0, 0];
                v[index] = [0, 0, 0];
                rho[index] = 0;

                dE[index] = [0, 0, 0];
                dB[index] = [0, 0, 0];
                dv[index] = [0, 0, 0];
                drho[index] = 0;
            }
        }
    }

    v[makeIdx(Math.floor(center[0]), Math.floor(center[1]), 0)] = [1, 0, 0];
    rho[makeIdx(Math.floor(center[0]), Math.floor(center[1]), 0)] = 1;
}

// currently boundary condition wraps all fields
const makeIdx = (...pos) => pos.reduce((p, c, i) => GRIDSIZE[i] * p + (c + GRIDSIZE[i]) % GRIDSIZE[i], 0);

const step = () => {
    let kineticEnergy = 0;

    let sumCharge = 0;
    let sumMagneticCharge = 0;

    max_rho = 0;

    // Calculate derivatives
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let z = 0; z < GRIDSIZE[2]; z++) {
                const index = makeIdx(x, y, z);

                // helper values

                const gradE = Array(3).fill().map(() => Array(3));
                const gradB = Array(3).fill().map(() => Array(3));
                const gradV = Array(3).fill().map(() => Array(3));
                const gradRho = Array(3);
                for (let j = 0; j < 3; j++) {
                    const pos = [x, y, z];
                    const forwardPos = [...pos], backwardPos = [...pos];
                    forwardPos[j]++; backwardPos[j]--;

                    const forwardIdx = makeIdx(...forwardPos);
                    const backwardIdx = makeIdx(...backwardPos);

                    // if (index === 0) console.log(E[forwardIdx], E[backwardIdx]);

                    for (let i = 0; i < 3; i++) {
                        gradE[j][i] = (E[forwardIdx][i] - E[backwardIdx][i]) / 2 / DX[j];
                        gradB[j][i] = (B[forwardIdx][i] - B[backwardIdx][i]) / 2 / DX[j];
                        gradV[j][i] = (v[forwardIdx][i] - v[backwardIdx][i]) / 2 / DX[j];
                    }
                    gradRho[j] = (rho[forwardIdx] - rho[backwardIdx]) / 2 / DX[j];
                }



                const vxB = cross(v[index], B[index]);

                const curlE = [gradE[1][2] - gradE[2][1], gradE[2][0] - gradE[0][2], gradE[0][1] - gradE[1][0]];
                const curlB = [gradB[1][2] - gradB[2][1], gradB[2][0] - gradB[0][2], gradB[0][1] - gradB[1][0]];
                // const curlV = [gradB[1][2] - gradB[2][1], gradB[0][2] - gradB[2][0], gradB[0][1] - gradB[1][0]]; (UNUSED)

                const divE = gradE[0][0] + gradE[1][1] + gradE[2][2];
                const divB = gradB[0][0] + gradB[1][1] + gradB[2][2];
                const divV = gradV[0][0] + gradV[1][1] + gradV[2][2];

                rho_c[index] = EPSILON * divE; // Also known as divE

                // set update values

                for (let i = 0; i < 3; i++) {
                    dE[index][i] = (curlB[i] / MU - rho_c[index] * v[index][i]) / EPSILON;
                    dB[index][i] = -curlE[i];
                    dv[index][i] = rho[index] !== 0 ? rho_c[index] / rho[index] * (E[index][i] - vxB[i]) : 0;
                }

                drho[index] = -dot(v[index], gradRho) - rho[index] * divV;
                // drho[index] = -dot(v[index], gradRho);

                kineticEnergy += 0.5 * rho[index] * dot(v[index], v[index]);

                sumCharge += rho_c[index] * DX[0] * DX[1] * DX[2];

                max_rho = Math.max(max_rho, rho_c[index], -rho_c[index]);
                sumMagneticCharge += divB;

                // if (index === 0) console.log(gradRho);
            }
        }
    }

    // console.log(sumCharge);
    // console.log(sumMagneticCharge);
    // console.log(max_rho);

    //update
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            for (let z = 0; z < GRIDSIZE[2]; z++) {
                const index = makeIdx(x, y, z);
                for (let i = 0; i < 3; i++) {
                    E[index][i] += DT * dE[index][i];
                    B[index][i] += DT * dB[index][i];
                    v[index][i] += DT * dv[index][i];
                }
                rho[index] = rho[index] + DT * drho[index];
            }
        }
    }
    draw();
    setTimeout(step, 1);
};

let canvas, ctx;

const draw = () => {
    const boxWidth = canvas.width / GRIDSIZE[0];
    const boxHeight = canvas.height / GRIDSIZE[1];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < GRIDSIZE[0]; x++) {
        for (let y = 0; y < GRIDSIZE[1]; y++) {
            const value = Math.floor(rho_c[makeIdx(x, y, 0)] / max_rho * 256);
            if (value > 0) ctx.fillStyle = `rgb(${value}, ${0},${0})`;
            else ctx.fillStyle = `rgb(${0}, ${0},${-value})`;

            // const ehere = E[makeIdx(x, y, 0)];

            // const value = (dot(ehere, [1, 0, 0]) / vecLength(ehere) + 1) / 2 * 256;
            // ctx.fillStyle = `rgb(${value}, ${value},${value})`;
            ctx.fillRect(x * boxWidth, y * boxHeight, boxWidth, boxHeight);
        }
    }
}

window.onload = () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init();
    step();
}