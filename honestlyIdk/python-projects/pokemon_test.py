import random
from collections import Counter
import numpy as np

board = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1]
]

start = (1, 1)

"""
BOARD REFERENCE:
    0 = empty
    1 = wall
    2 = goal
"""

OBS_DIST = 1
ALPHA = 0.1
GAMMA = 0.9
GOAL_REWARD = 100
ACTIONS = ['u', 'd', 'l', 'r']
MAX_TRACK = 10
ALL_PATTERNS = Counter()


def run(debug=False):
    for _ in range(10):
        past = []
        pos = start
        steps = 0
        while board[pos[0]][pos[1]] != 2:
            obs = get_obs(pos)
            past = (past + [obs])[-MAX_TRACK:]

            # NEED TO MAKE IT ACCOUNT FOR GOAL OOPS
            if random.random() > ALPHA:
                next_action = best_move(past)
            else:
                next_action = np.random.choice(ACTIONS)

            past = (past + [next_action])[-MAX_TRACK:]
            pos = move(pos, next_action)
            steps += 1
        if debug:
            print(steps)
        add_to_cache(past)


def best_move(past, randomize=False, debug=False):
    p = []
    l = MAX_TRACK
    while sum(p) == 0 and l > 0:
        l -= 1
        running_pattern = past[-l:]
        p = [count_matches(tuple(running_pattern + [action]))
             for action in ACTIONS]

    if l > 0:
        if randomize:
            return np.random.choice(
                ACTIONS, p=[a/sum(p) for a in p])
        if debug:
            print(p)
        return ACTIONS[np.random.choice(allmax(p))]
    return np.random.choice(ACTIONS)


def add_to_cache(obs_list):
    for i in range(len(obs_list)):
        ALL_PATTERNS[tuple(obs_list[-(i+1):])] += 1


def move(pos, action):
    switcher = {
        'u': (-1, 0),
        'd': (1, 0),
        'l': (0, -1),
        'r': (0, 1)
    }
    new_pos = tuple(a + switcher[action][i] for i, a in enumerate(pos))
    if board[new_pos[0]][new_pos[1]] != 1:
        return new_pos
    return pos


def get_obs(pos):
    return tuple(tuple(box for x, box in enumerate(line) if abs(x-pos[1]) <= OBS_DIST) for y, line in enumerate(board) if abs(y-pos[0]) <= OBS_DIST)


def allmax(a):
    if len(a) == 0:
        return []
    all_ = [0]
    max_ = a[0]
    for i in range(1, len(a)):
        if a[i] > max_:
            all_ = [i]
            max_ = a[i]
        elif a[i] == max_:
            all_.append(i)
    return all_


def count_matches(pattern):
    return sum([ALL_PATTERNS[big_pattern]*GAMMA**(len(big_pattern)-len(pattern)) for big_pattern in ALL_PATTERNS if starts_with(big_pattern, pattern)])


def starts_with(to_check, pattern):
    return len(to_check) >= len(pattern) and all([type(a) == type(to_check[i]) and a == to_check[i] for i, a in enumerate(pattern)])


run(True)

print(count_matches([((0, 0, 0), (0, 0, 0), (1, 1, 1))]))

print(best_move([((0, 0, 0), (0, 0, 0), (1, 1, 1))], debug=True))
# print(ALL_PATTERNS.values())
