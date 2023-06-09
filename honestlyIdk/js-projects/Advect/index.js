let canvas, ctx;
window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init();
    step();
};

const WIDTH = 150, HEIGHT = 100;

const DX = 0.1, DT = 0.01;
const stepsPerFrame = 1;
const G = 1;

const psi = Array(HEIGHT).fill().map(() => Array(WIDTH));
const psi_next = Array(HEIGHT).fill().map(() => Array(WIDTH));
const v = Array(HEIGHT).fill().map(() => Array(WIDTH));
const v_dot = Array(HEIGHT).fill().map(() => Array(WIDTH));
const distances = Array(HEIGHT).fill().map(() => Array(WIDTH).fill().map(() => Array(HEIGHT).fill().map(() => Array(WIDTH))));

const init = () => {
    const omega = Math.random() * 10 - 5
    const center = [Math.random() * 100, Math.random() * 100]
    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            psi[y][x] = Math.random();
            v[y][x] = [Math.random() * 10 - 5, Math.random() * 10 - 5];
        }
    }
}

const getPsi = (x, y) => {
    // if (x < 0) return 2 * getPsi(0, y) - getPsi(1, y);
    // if (x >= WIDTH) return 2 * getPsi(WIDTH - 1, y) - getPsi(WIDTH - 2, y);
    // if (y < 0) return 2 * getPsi(x, 0) - getPsi(x, 1);
    // if (y >= HEIGHT) return 2 * getPsi(x, HEIGHT - 1) - getPsi(x, HEIGHT - 2);
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return 0;
    return psi[(y + HEIGHT) % HEIGHT][(x + WIDTH) % WIDTH];
}

const getV = (x, y) => {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return [0, 0];
    return v[(y + HEIGHT) % HEIGHT][(x + WIDTH) % WIDTH];
}

const step = () => {

    draw();

    for (let s = 0; s < stepsPerFrame; s++) {

        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                const psi_x_plus = getPsi(x + 1, y);
                const psi_x_minus = getPsi(x - 1, y);
                const psi_y_plus = getPsi(x, y + 1);
                const psi_y_minus = getPsi(x, y - 1);

                const grad_psi = [psi_x_plus - psi_x_minus, psi_y_plus - psi_y_minus].map(a => a / 2 / DX);

                const laplacian_psi = (psi_x_plus + psi_x_minus + psi_y_plus + psi_y_minus - 4 * psi[y][x]) / DX / DX;

                v_dot[y][x] = [0, 0];
                for (let oy = 0; oy < HEIGHT; oy++) {
                    for (let ox = 0; ox < WIDTH; ox++) {
                        if (ox === x && oy === y) continue;
                        if (distances[y][x][oy][ox] === undefined) {
                            distances[y][x][oy][ox] = Math.sqrt((ox - x) ** 2 + (oy - y) ** 2);
                        }
                        const dist = distances[y][x][oy][ox];
                        const diff = [(ox - x) / dist, (oy - y) / dist];
                        const scale = G * psi[oy][ox] / dist / dist;
                        v_dot[y][x] = diff.map((a, i) => v_dot[y][x][i] + a * scale);
                    }
                }

                const v_squared = v[y][x][0] * v[y][x][0] + v[y][x][1] * v[y][x][1];

                const v_dot_grad = v[y][x][0] * grad_psi[0] + v[y][x][1] * grad_psi[1];

                const v_dot_dot_grad = v_dot[y][x][0] * grad_psi[0] + v_dot[y][x][1] * grad_psi[1];

                psi_next[y][x] = psi[y][x] - v_dot_grad * DT + (laplacian_psi * v_squared - v_dot_dot_grad) * DT * DT / 2;
            }
        }

        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                psi[y][x] = Math.max(0, psi_next[y][x]);
                // console.log(v_dot[y][x]);
                v[y][x] = v_dot[y][x].map((a, i) => v[y][x][i] + a * DT);
            }
        }
    }
    setTimeout(step, 100);
}

const draw = () => {
    const boxWidth = canvas.width / WIDTH;
    const boxHeight = canvas.height / HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const value = Math.floor(psi[y][x] * 256);
            ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
            ctx.fillRect(x * boxWidth, y * boxHeight, boxWidth, boxHeight);
        }
    }

}