import random
from Cards import Card, Player
import Cards
from matplotlib import pyplot as plt
import numpy as np


class Game:
    def __init__(self, num_players):
        self.deck = [Card(v, s) for v in Cards.values for s in Cards.suits]
        random.shuffle(self.deck)
        self.players = [Player(self.deck, 2) for _ in range(num_players)]
        self.table = [self.deck.pop() for _ in range(5)]

    def test_win(self):
        hands = [p.get_hand(self.table) for p in self.players]
        return np.argmax(hands), max(hands)


# my_game = Game(2)
# print('\n'.join([str([str(card) for card in player.hand])
#                  for player in my_game.players]))
# print('table:', [str(card) for card in my_game.table])
# my_game.test_win()

NUM_MONTE = 10
NUM = 1000
PLAYERS = 10
PERCENTILES = 100

mean_percentile = np.zeros((PERCENTILES-1, PLAYERS-1))

for _ in range(NUM_MONTE):
    my_data = [np.sort([Game(n).test_win()[1] for _ in range(NUM)])
               for n in range(2, PLAYERS+1)]
    mean_percentile += np.array([[d[int(NUM/PERCENTILES*n)] for d in my_data]
                                 for n in range(1, PERCENTILES)]) / NUM_MONTE

# plt.figure()
# for i in range(10):
#     plt.subplot(2, 5, i+1)
#     plt.hist(my_data[i], 9, (0, 9))

for n in range(1, PERCENTILES):
    plt.plot(range(2, PLAYERS+1),
             mean_percentile[n-1], color='r' if n == PERCENTILES / 2 else 'k' if n % 10 == 0 else 'gray', linewidth=3 if n % 10 == 0 else 1)
plt.grid()
plt.show()
