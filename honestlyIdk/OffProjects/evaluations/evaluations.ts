import { pick } from "./util";

export const makeRandomPolicy =
    <S>(getActions: (s: S) => [S, number][][]) =>
    (s: S) => {
        const actions = getActions(s);
        return actions[Math.floor(Math.random() * actions.length)];
    };

export const monteCarloEvaluatePolicyAtState = <S>(
    state: S,
    policy: (s: S) => [S, number][],
    getTerminalValue: (s: S) => number | null,
    iterations = 10000,
    maxStateChanges = Number.POSITIVE_INFINITY,
    evaluateNonterminalState?: (s: S) => number
) => {
    let value = 0;

    for (let i = 0; i < iterations; i++) {
        let currentState = state;
        for (let t = 0; t < maxStateChanges; t++) {
            const terminalValue = getTerminalValue(currentState);
            if (terminalValue !== null) {
                value += terminalValue;
                break;
            }

            currentState = pick(policy(state));
        }
        if (!evaluateNonterminalState)
            throw new Error(
                "Went over maxStateChanges but evaluateNonterminalState was not set!"
            );
        value += evaluateNonterminalState(currentState);
    }

    return value / iterations;
};

export const evaluatePolicyAtState = <S>(
    state: S,
    policy: (s: S) => [S, number][],
    getTerminalValue: (s: S) => number | null
) => {
    const terminalValue = getTerminalValue(state);
    if (terminalValue !== null) return terminalValue;
    return evaluateActionResultsWithPolicy(
        policy(state),
        policy,
        getTerminalValue
    );
};

export const evaluateActionResultsWithPolicy = <S>(
    actionResults: [S, number][],
    policy: (s: S) => [S, number][],
    getTerminalValue: (s: S) => number | null
) => {
    let sum = 0;
    for (const [nextState, probability] of actionResults) {
        sum +=
            probability *
            evaluatePolicyAtState(nextState, policy, getTerminalValue);
    }
    return sum;
};

export const evaluateActionResultsWithAdaptivePolicy = <S>(
    actionResults: [S, number][],
    policy: (
        actionResults: [[S, number][], number][]
    ) => [[S, number][], number],
    getActions: (s: S) => [S, number][][],
    getTerminalValue: (s: S) => number | null
) => {
    let sum = 0;
    for (const [nextState, probability] of actionResults) {
        sum +=
            probability *
            evaluateStateWithAdaptivePolicy(
                nextState,
                policy,
                getActions,
                getTerminalValue
            );
    }
    return sum;
};

export const evaluateStateWithAdaptivePolicy = <S>(
    state: S,
    policy: (
        actionResults: [[S, number][], number][]
    ) => [[S, number][], number],
    getActions: (s: S) => [S, number][][],
    getTerminalValue: (s: S) => number | null
) => {
    const terminalValue = getTerminalValue(state);
    if (terminalValue !== null) return terminalValue;

    const actions = getActions(state);
    const [chosenResults, evaluation] = policy(
        actions.map(
            (actionResults) =>
                [
                    actionResults,
                    evaluateActionResultsWithAdaptivePolicy(
                        actionResults,
                        policy,
                        getActions,
                        getTerminalValue
                    ),
                ] as [[S, number][], number]
        )
    );

    return evaluation;
};
