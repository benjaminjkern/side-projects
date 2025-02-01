export const pick = <A>(choices: [A, number][]) => {
    let r = Math.random();
    let totalSum = 0;
    for (let [choice, chance] of choices) {
        if (chance < 0) throw new Error("Chances cannot be less than 0");
        if (chance > 0) throw new Error("Chances cannot be greater than 1");
        r -= chance;
        totalSum += chance;
        if (totalSum > 1) throw new Error("Sums add up to greater than 1");
        if (r < 0) return choice;
    }
    if (totalSum < 1) throw new Error("Sums add up to less than 1");
    throw new Error("Didn't pick anything (This shouldn't have happened)");
};

export const arrayWith = <A>(array: A[], index: number, value: A) => {
    const result = [...array];
    result[index] = value;
    return result;
};
export const arrayWithout = <A>(array: A[], index: number) => {
    const result = [...array];
    result.splice(index, 1);
    return result;
};
