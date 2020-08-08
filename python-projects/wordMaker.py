import numpy as np
import re
from collections import Counter


class wordMaker():
    def __init__(self, look_back, ref_text):
        self.patterns = Counter()
        self.look_back = look_back
        self.poss_letters = set()

        # likes = re.compile(' \d+')
        # date = re.compile('[A-Z]{3} \d?\d, \d?\d:\d\d (A|P)M')
        # other = re.compile(
        #     '(Poll \'.*?\' (is about to expire|has expired)|.+? has (left the group.|joined the group|(enabled|disabled) group sharing.))')

        # unfilteredPosts = open(ref_text).read().split('Avatar')
        # unfilteredPosts = [post.split('\n') for post in unfilteredPosts]
        # posts = [[line for line in post if line] for post in unfilteredPosts]

        # book = []
        # for post in posts:
        #     for index, line in enumerate(post):
        #         if date.match(line) and index == len(post)-1:
        #             book.append('['+line+']')
        #             continue
        #         if index == 0:
        #             book.append(line+':')
        #             continue
        #         if likes.match(line):
        #             continue

        #         if likes.match(post[index-1]):
        #             num_likes = int(post[index-1])

        #         if other.match(line):
        #             book.append(
        #                 '*** '+line+(' ('+str(num_likes)+' like'+('' if num_likes == 1 else 's')+')' if num_likes else ''))
        #             continue

        #         book.append(
        #             '    '+line+(' ('+str(num_likes)+' like'+('' if num_likes == 1 else 's')+')' if num_likes else ''))

        # book = '\n'.join(book)

        book = open(ref_text).read()

        for i, letter in enumerate(book):

            # make sure the word maker knows that the letter is possible to generate
            self.poss_letters.add(letter)

            # store all substrings up to max look-back from each index
            for l in range(look_back):
                self.patterns[book[i:(i+l+1)]] += 1

    def make_one(self, length, inp=''):
        total_text = inp

        for _ in range(length):

            # If you can't find any matches at the current look-back length, just shorten it by one and check again
            p = []
            l = self.look_back
            while sum(p) == 0:
                l -= 1
                running_pattern = total_text[-l:]
                p = [self.patterns[running_pattern + letter]
                     for letter in self.poss_letters]

            # pick a letter randomly, weighted by whats most likely, and add it to the running total
            next_letter = np.random.choice(
                [letter for letter in self.poss_letters], p=[a/sum(p) for a in p])
            total_text += next_letter

        return total_text

    # If you wanna make multiple and return them in a list
    def make(self, length, amount=1, inp=''):
        return [self.make_one(length, inp) for _ in range(amount)]


if __name__ == '__main__':
    ben = wordMaker(10, 'newintown.txt')
    print('\n'.join(ben.make(2000)))
