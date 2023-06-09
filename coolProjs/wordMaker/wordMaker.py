import numpy as np
import re
from collections import Counter
import math


class wordMaker:
    start_string = ""
    end_string = ""

    def __init__(self, look_back, entries):
        self.patterns = Counter()
        self.look_back = look_back
        self.poss_letters = set()
        # entries = entries[0].split("\n")
        self.total_letters = sum(
            [len(self.start_string + entry + self.end_string) for entry in entries]
        )

        # print("Reading Entries...")

        for entry in entries:
            full_entry = self.start_string + entry + self.end_string
            for i, letter in enumerate(full_entry):

                # make sure the word maker knows that the letter is possible to generate
                self.poss_letters.add(letter)

                # store all substrings up to max look-back from each index
                for l in range(look_back):
                    if i + l + 1 > len(full_entry):
                        break
                    self.patterns[full_entry[i : (i + l + 1)]] += 1

        # print("Done preprocessing!")

    def make(self, max_length, min_length=0, inp=None):

        total_text = inp or self.start_string

        for _ in range(max_length + 1):

            letters = [
                letter
                for letter in self.poss_letters
                # if letter != self.end_string or len(total_text) >= min_length
            ]

            # Add up all probabilities of all possible letters, weighted by how far back it looked
            # p = [0 for _ in letters]

            # for l in range(1, self.look_back + 1):
            #     to_add = [self.patterns[total_text[-l:] + letter] for letter in letters]
            #     pattern_sum = sum(to_add)
            #     if pattern_sum > 0:
            #         for i, letter in enumerate(letters):
            #             p[i] += l * to_add[i] / pattern_sum
            # p[i] += 1 - ((1 - to_add[i] / pattern_sum) ** l)

            # If you can't find any matches at the current look-back length, just shorten it by one and check again
            p = []
            l = self.look_back
            while sum(p) == 0:
                # while sum([int(bool(prob)) for prob in p]) <= 1:
                l -= 1

                p = [self.patterns[total_text[-l:] + letter] for letter in letters]

            # pick a letter randomly, weighted by whats most likely, and add it to the running total
            new_letter = np.random.choice(letters, p=[a / sum(p) for a in p])

            total_text += new_letter

            if (
                self.end_string
                and total_text[-len(self.end_string) :] == self.end_string
            ):
                break

        if self.end_string:
            return total_text[len(self.start_string) : -len(self.end_string)]

        return total_text[len(self.start_string) :]

    # If you wanna make multiple and return them in a list
    def make_many(self, max_length, min_length=0, amount=1, inp=""):
        for _ in range(amount):
            print(self.make(max_length, min_length, inp), "\n")

    """
        def make_one(self, max_length, min_length=0, inp=""):
        # while True:
        #     total_text = inp

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
                        letter for letter in self.poss_letters if letter != "\n"
                    ]

                p = [self.patterns[running_pattern + letter] for letter in letters]

            # pick a letter randomly, weighted by whats most likely, and add it to the running total

            next_letter = np.random.choice(
                [letter for letter in letters], p=[a / sum(p) for a in p]
            )

            # if next_letter == "\n":
            #     if any(
            #         [
            #             total_text[1:].lower() in name.lower()
            #             or name[1:-1].lower() in total_text.lower()
            #             for name in self.names
            #         ]
            #     ):
            #         continue
            #     checked = True
            #     break

            total_text += next_letter

            # if checked or not any(
            #     [
            #         total_text[1:].lower() in name.lower()
            #         or name[1:-1].lower() in total_text.lower()
            #         for name in self.names
            #     ]
            # ):
            #     break
        return total_text
    """


if __name__ == "__main__":
    full_script = open("marissa.txt").read()
    ben = wordMaker(8, [full_script])
    ben.make_many(2000, amount=1)


"""
Notes:

- Force different
    - Output cannot be a substring or superstring of any inputs
    - Not implemented
    
- By word/letter
    - Currently by letter

- Average probability or longest possible match
    - Currently longest possible match
    - Another idea is longest possible match with ambiguity
        - If there exists only 1 possible pattern at a certain lookback length, still skip it and shrink lookback, force it to choose between at least 2 possibilities every time
            - Nah this sucks
    - Average probability, weighted towards longer matches

- Simulated start / simulated end
    - IMPLEMENTED

"""
