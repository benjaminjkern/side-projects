from Cards import Card, Player
import Cards
import random
import numpy as np


class Game:
    def __init__(self, table):
        self.deck = list({Card(v, s)
                          for v in Cards.values for s in Cards.suits} - table)
        random.shuffle(self.deck)
        self.dealer = [Player(self.deck, 2)]
        self.players = [Player(self.deck, 2)
                        for _ in range(num_opponents + len(start_players))]

    def test_win(self):
        scores = [p.score() for p in self.players]
        return np.argmax(scores), max(scores)


my_game = Game({Card('2', 'Clubs'), })
print('\n'.join([str(([str(card) for card in player.hand], player.score()))
                 for player in my_game.players]))
