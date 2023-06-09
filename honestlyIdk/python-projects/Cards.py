import numpy as np
from collections import Counter

values = ['2', '3', '4', '5', '6', '7', '8',
          '9', '10', 'Jack', 'Queen', 'King', 'Ace']
valueMap = {a: i+2 for i, a in enumerate(values)}
suits = {'Spades', 'Clubs', 'Hearts', 'Diamonds'}


class Card:
    def __init__(self, value, suit):
        self.value = value
        self.suit = suit

    def __str__(self):
        return self.value + ' of ' + self.suit

    def __eq__(self, other):
        return self.value == other.value and self.suit == other.suit

    def __hash__(self):
        return hash(self.suit) + hash(self.value)


class Player:
    def __init__(self, deck, num_cards):
        self.hand = [deck.pop() for _ in range(num_cards)]

    def get_hand(self, table):

        cards = table + self.hand
        card_suits = [c.suit for c in cards]
        card_values = np.sort([valueMap[c.value] for c in cards])
        num_values = Counter(card_values)
        num_suits = Counter(card_suits)

        points = (max(card_values)-2)/13  # high card

        if max(num_suits.values()) >= 5:
            the_suit = [suit for suit in num_suits if num_suits[suit]
                        == max(num_suits.values())]
            allOfSuit = [np.sort(
                [valueMap[card.value] for card in cards if card.suit == suit])[::-1] for suit in the_suit]

            straightFlush = [self.checkStraight(suit_cards)
                             for suit_cards in allOfSuit]
            if max(straightFlush) > 0:
                points = max(points, 4 + max(straightFlush))  # straight flush

            suitValues = [sum([(value-2)/13/(100**(index))
                               for index, value in enumerate(suit)]) for suit in allOfSuit]

            points = max(points, 5 + max(suitValues))  # flush

        points = max(points, self.checkStraight(card_values))  # straight

        fours = np.sort([v for v in num_values if num_values[v] == 4])
        threes = np.sort([v for v in num_values if num_values[v] == 3])
        twos = np.sort([v for v in num_values if num_values[v] == 2])

        if any(fours):
            points = max(points, 7 + (fours[-1]-2)/13)  # 4 of a kind

        if any(threes):
            if any(twos):
                # full house
                points = max(points, 6 + (threes[-1]-2)/13 + (twos[-1]-2)/1300)
            else:
                points = max(points, 3 + (threes[-1]-2)/13)  # 3 of a kind

        if any(twos):
            if len(twos) >= 2:
                points = max(
                    points, 2 + (twos[-1]-2) / 13 + (twos[-2]-2)/1300)  # 2 pair
            else:
                points = max(points, 1 + (twos[-1]-2)/13)  # pair

        return points

    def checkStraight(self, card_values):
        for card in np.sort(card_values)[::-1]:
            if len(np.unique([s_card for s_card in card_values if s_card in range(card-4, card+1)])) >= 5:
                return 4 + (card-2)/13
        return 0

    def score(self):  # blackjack
        scores = [min(valueMap[c.value], 10) if valueMap[c.value]
                  < 14 else 11 for c in self.hand]
        while sum(scores) > 21:
            if 11 not in scores:
                return sum(scores)
            scores[np.argmax(scores)] = 1
        return sum(scores)


# 0 = high card
# 1 = pair
# 2 = 2 pair
# 3 = 3 of a kind
# 4 = straight
# 5 = flush
# 6 = full house
# 7 = four of a kind
# 8 = straight flush
