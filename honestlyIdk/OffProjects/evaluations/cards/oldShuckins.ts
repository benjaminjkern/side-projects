import { arrayWith, arrayWithout } from "../util";
import { Card } from "./cards";

type Hand = {
    hand: Card[];
    reserve: [Card[], Card[], Card[], Card[]];
    playCards: Card[];
};
type State = {
    deck: Card[];
    sharedDecks: [Card[], Card[], Card[], Card[], Card[]];
    players: Hand[];
    turn: number;
};

const getActions = (state: State): [() => State, number][] => {
    const actions: (() => State)[] = [];
    const player = state.players[state.turn];
    for (const [i, sharedDeck] of state.sharedDecks.entries()) {
        const availableCard = sharedDeck[sharedDeck.length - 1];
        for (const [j, card] of player.hand.entries()) {
            if (availableCard === undefined && card.value === "A") {
                actions.push(() => ({
                    ...state,
                    players: arrayWith(state.players, state.turn, {
                        ...player,
                        hand: arrayWithout(player.hand, j),
                    }),
                    sharedDecks: arrayWith(state.sharedDecks, i, [
                        ...sharedDeck,
                        card,
                    ]) as [Card[], Card[], Card[], Card[], Card[]],
                }));
            }
        }
    }
};
