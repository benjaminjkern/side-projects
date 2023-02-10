const colors = require('colors');

const polDiff = (opinion1, opinion2) => Math.sqrt(opinion1.reduce((p, c, i) => p + (c - opinion2[i]) ** 2, 0))

const agreement = (opinion1, opinion2) => Math.exp(-polDiff(opinion1, opinion2));

const score = (candidate, population) => candidate.competancy * population.reduce((p, c) => agreement(c.opinions, candidate.opinions) + p, 0);

const totalAgreement = (candidate, population) => population.reduce((p, c) => agreement(c.opinions, candidate.opinions) + p, 0);

const averageOpinion = (population) => population.reduce((p, c) => c.opinions.map((o, i) => o + p[i]), Array(dimensions).fill(0)).map(o => o / numPeople);


const numPeople = 100;
const dimensions = 100;



let comp = 0;
let avav = 0;
let winav = 0;

const numRounds = 100;

for (let _ in Object.keys(Array(numRounds).fill(0))) {
    const allPeople = Array(numPeople).fill(0).map(() => ({ competancy: Math.random(), opinions: Array(dimensions).fill(0).map(() => Math.random() * 2 - 1) }));

    // console.log(allPeople);
    const winner = allPeople.reduce((best, person) => (best === undefined || score(best, allPeople) < score(person, allPeople)) ? person : best, undefined);
    const avOp = averageOpinion(allPeople);
    comp += winner.competancy;
    avav += allPeople.reduce((p, person) => p + polDiff(avOp, person.opinions), 0) / numPeople;
    winav += polDiff(avOp, winner.opinions);

}



console.log(`Winner competancy: ${(comp/numRounds+'').yellow}`);
console.log(`Average average diff from average: ${(avav/numRounds+'').yellow}`);
console.log(`Average winner diff from average: ${(winav/numRounds+'').yellow}`);