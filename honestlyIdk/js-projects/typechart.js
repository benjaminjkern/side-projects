const typeChart = `1	1	1	1	1	1	2	1	1	1	1	1	1	0	1	1	1	1
1	0.5	2	1	0.5	0.5	1	1	2	1	1	0.5	2	1	1	1	0.5	0.5
1	0.5	0.5	2	2	0.5	1	1	1	1	1	1	1	1	1	1	0.5	1
1	1	1	0.5	1	1	1	1	2	0.5	1	1	1	1	1	1	0.5	1
1	2	0.5	0.5	0.5	2	1	2	0.5	2	1	2	1	1	1	1	1	1
1	2	1	1	1	0.5	2	1	1	1	1	1	2	1	1	1	2	1
1	1	1	1	1	1	1	1	1	2	2	0.5	0.5	1	1	0.5	1	2
1	1	1	1	0.5	1	0.5	0.5	2	1	2	0.5	1	1	1	1	1	0.5
1	1	2	0	2	2	1	0.5	1	1	1	1	0.5	1	1	1	1	1
1	1	1	2	0.5	2	0.5	1	0	1	1	0.5	2	1	1	1	1	1
1	1	1	1	1	1	0.5	1	1	1	0.5	2	1	2	1	2	1	1
1	2	1	1	0.5	1	0.5	1	0.5	2	1	1	2	1	1	1	1	1
0.5	0.5	2	1	2	1	2	0.5	2	0.5	1	1	1	1	1	1	2	1
0	1	1	1	1	1	0	0.5	1	1	1	0.5	1	2	1	2	1	1
1	0.5	0.5	0.5	0.5	2	1	1	1	1	1	1	1	1	2	1	1	2
1	1	1	1	1	1	2	1	1	1	0	2	1	0.5	1	0.5	1	2
0.5	2	1	1	0.5	0.5	2	0	2	0.5	0.5	0.5	0.5	1	0.5	1	0.5	0.5
1	1	1	1	1	1	0.5	2	1	1	1	0.5	1	1	0	0.5	2	1`.split('\n').map(line => line.split('\t').map(a => a - 0));

// console.log(typeChart);

const names = `Normal	Fire	Water	Electric	Grass	Ice	Fighting	Poison	Ground	Flying	Psychic	Bug	Rock	Ghost	Dragon	Dark	Steel	Fairy`.split('\t');

const typeChart2 = [];

const statsChart = [];
const statsChart2 = [];

const weaknessChart = [];


for (let i = 0; i < 18; i++) {
    statsChart.push([names[i], 0])
    for (let j = 0; j < 18; j++) {
        const name = i === j ? [names[i], '*'] : [names[i], names[j]];
        if (i === j) typeChart2.push([...name, ...typeChart[i]]);
        else typeChart2.push([...name, ...typeChart[i].map((a, n) => a * typeChart[j][n])]);
        statsChart2.push([...name, typeChart2[typeChart2.length - 1].slice(2).reduce((p, c) => p + c / 18, 0)]);
        statsChart[statsChart.length - 1][1] += statsChart2[statsChart2.length - 1][2] / 18;
        weaknessChart.push([...name, typeChart2[typeChart2.length - 1].slice(2).reduce((p, c) => ({...p, [c - 0]: (p[c - 0] || 0) + 1 }), {})]);
    }
}

// statsChart.sort((a, b) => a[1] - b[1]);

// statsChart2.sort((a, b) => a[2] - b[2]);
// console.log(statsChart2);

const attackChart = statsChart.map(([name], i) => [name, typeChart2.reduce((p, c) => p + c[2 + i] / 18 / 18, 0)]);

// attackChart.sort((a, b) => a[1] - b[1]);

const diffChart2 = [];

const attackChart2 = [];

for (let i = 0; i < 18; i++) {
    for (let j = 0; j < 18; j++) {
        const name = i === j ? [names[i], '*'] : [names[i], names[j]];
        attackChart2.push([...name, (attackChart[i][1] + attackChart[j][1]) / 2]);
        diffChart2.push([...name, attackChart2[attackChart2.length - 1][2] / statsChart2[attackChart2.length - 1][2]]);
    }
}
diffChart2.sort((a, b) => b[2] - a[2]);

console.log(diffChart2);

// weaknessChart.sort((a, b) => {
//     for (const val of[4, 2, 1, 0.5, 0.25, 0]) {
//         if (a[2][val] === b[2][val]) continue;
//         return a[2][val] - b[2][val];
//     }
//     return 0;
// })

// weaknessChart.sort((a, b) => {
//     for (const val of[0, 0.25, 0.5, 1, 2, 4]) {
//         if (a[2][val] === b[2][val]) continue;
//         return b[2][val] - a[2][val];
//     }
//     return 0;
// });

// console.log(weaknessChart);

/* Defensive based on most amount of strong blockers:
 * 1. Normal + Ghost
 * 2. Normal + Steel
 * 3. Normal + Fairy
 * 4. Normal + Flying
 * 5. Normal + Ground
 */

/* Defensive based on least amount of bad weaknesses:
 * 1. Normal + Ghost
 * 2. Normal
 * 3. Normal + Poison
 * 4. Normal + Fairy
 * 5. Normal + Electric
 */

/* Defensive based on average damage taken (Assuming all same power move and all attack types are equally likely):
 * 1. Steel + Fairy
 * 2. Flying + Steel
 * 4. Ghost + Steel
 * 4. Dragon + Steel
 * 5. Water + Steel
 */

/* Offensive based on average damage dealt (Assuming all same power move and all types and cross types are equally likely):
 * 1. Ground
 * 2. Ground + Rock
 * 3. Rock
 * 5. Fire + Ground
 * 5. Ice + Ground
 */

/* Average damage dealt - Average damage taken:
 * 1. Steel + Fairy
 * 2. Flying + Steel
 * 3. Gound + Steel
 * 4. Water + Steel
 * 5. Ghost + Steel
 */