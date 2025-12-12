const seen = {};
let tooLow = 0;
let totalSeen = 0;
while (true) {
    const nums = Array(2)
        .fill()
        .map(() => Math.ceil(Math.random() * 10 ** 3));
    const power = 2;

    const sum = nums.reduce((sum, num) => sum + num ** power, 0);
    const num = Number(nums.join(""));

    const key = `${nums
        .map((num) => `${num}^${power}`)
        .join(" + ")} = ${nums.join("")}`;

    if (Math.random() < 1 / 1000000) console.log(tooLow / totalSeen);
    if (seen[key]) continue;
    seen[key] = true;

    totalSeen++;
    if (sum < num) tooLow++;

    if (sum === num) {
        const key = `${nums
            .map((num) => `${num}^${power}`)
            .join(" + ")} = ${nums.join("")}`;
        console.log(key);
    }
}

/*
12^2 + 33^2 = 1233
88^2 + 33^2 = 8833
10^2 + 100^2 = 10100
10^2 + 1^2 = 101

3^3 + 7^3 + 1^3 = 371
1^3 + 5^3 + 3^3 = 153
98^3 + 32^3 + 21^3 = 983221
4^3 + 16^3 + 1^3 = 4161
34^3 + 10^3 + 67^3 = 341067
2^3 + 2^3 + 13^3 = 2213
48^3 + 72^3 + 15^3 = 487215
16^3 + 50^3 + 33^3 = 165033
22^3 + 18^3 + 59^3 = 221859
4^3 + 18^3 + 33^3 = 41833
98^3 + 28^3 + 27^3 = 982827
44^3 + 46^3 + 64^3 = 444664

*/
