const convertToNum = (arr, originalBase) => {
    const b = BigInt(originalBase);
    let n = 0n;
    for (let i = 0; i < arr.length; i++) {
        n *= b;
        n += arr[i];
    }
    return n;
};

const convertToBase = (num, base) => {
    const b = BigInt(base);
    let n = BigInt(num);

    const result = [];
    while (n > 0n) {
        result.unshift(n % b);
        n /= b;
    }
    return result;
};

const isPalindrome = (arr) => {
    for (let i = 0; i < arr.length / 2; i++) {
        if (arr[i] !== arr[arr.length - 1 - i]) return false;
    }
    return true;
};

const makePalindromes = (arr) => {
    const small = [...arr];
    const big = [...arr];
    for (let i = arr.length - 1; i >= 0; i--) {
        if (i < arr.length - 1) small.push(arr[i]);
        big.push(arr[i]);
    }
    return [small, big];
};

let i = 1n;
let startBase = 2;
while (true) {
    const [small, big] = makePalindromes(convertToBase(i, startBase));

    const smallNum = convertToNum(small, startBase);
    const bigNum = convertToNum(big, startBase);

    let base = startBase + 1;
    while (true) {
        const smallInBase = convertToBase(smallNum, base);
        if (smallInBase.length === 1) {
            // console.log("Hit single");
            break;
        }
        if (!isPalindrome(smallInBase)) break;
        console.log(smallNum, small.join(""), base, smallInBase.join(","));
        base += 1;
    }

    base = startBase + 1;
    while (true) {
        const bigInBase = convertToBase(bigNum, base);
        if (bigInBase.length === 1) {
            // console.log("Hit single");
            break;
        }
        if (!isPalindrome(bigInBase)) break;
        console.log(bigNum, big.join(""), base, bigInBase.join(","));
        base += 1;
    }
    i += 1n;
}
