import numpy as np
import re
from collections import Counter


class wordMaker():
    def __init__(self, look_back, ref_text):
        self.patterns = Counter()
        self.look_back = look_back
        self.poss_letters = set()

        self.names = ['\t'+line.split(' ')[-1].replace('˚', '')+'\n' for i, line in enumerate(
            open(ref_text).read().split('\n')) if i != 0]

        # print(self.names)

        # Don't worry about this entire commented out section, I used this program to reformat GroupMe text, because by default copying and pasting GroupMe text looks awful.

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

        for name in self.names:
            for i, letter in enumerate(name):

                # make sure the word maker knows that the letter is possible to generate
                self.poss_letters.add(letter)

                # store all substrings up to max look-back from each index
                for l in range(look_back):
                    self.patterns[name[i:(i+l+1)]] += 1

    def make_one(self, max_length, min_length=0, inp='\t'):
        self.t += 1
        while True:
            total_text = inp

            checked = False

            for i in range(max_length):

                # If you can't find any matches at the current look-back length, just shorten it by one and check again
                p = []
                l = self.look_back
                while sum(p) == 0:
                    l -= 1
                    running_pattern = total_text[-l:]
                    if i >= min_length:
                        letters = self.poss_letters
                    else:
                        letters = [
                            letter for letter in self.poss_letters if letter != '\n']

                    p = [self.patterns[running_pattern + letter]
                         for letter in letters]

                # pick a letter randomly, weighted by whats most likely, and add it to the running total

                next_letter = np.random.choice(
                    [letter for letter in letters], p=[a/sum(p) for a in p])

                if next_letter == '\n':
                    if any([total_text[1:].lower() in name.lower() or name[1:-1].lower() in total_text.lower() for name in self.names]):
                        continue
                    checked = True
                    break

                total_text += next_letter

            if checked or not any([total_text[1:].lower() in name.lower() or name[1:-1].lower() in total_text.lower() for name in self.names]):
                break

        # numCaps = np.random.rand()
        # return ''.join([(l.upper() if np.random.rand() > numCaps else l) for l in total_text])
        # print(self.t)
        return total_text[1:]

    # If you wanna make multiple and return them in a list
    def make(self, max_length, min_length=0, amount=1, inp='\t'):
        self.t = 0
        for _ in range(amount):
            print(self.make_one(max_length, min_length, inp))


if __name__ == '__main__':
    ben = wordMaker(16, 'names4.txt')
    ben.make(16, 3, 10)
