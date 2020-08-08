from POMDP import *

class MDPGrid(MDP):
    def __init__(self, grid_file, accident = 0, win_reward = 0, lose_reward = 0, living_reward = 0):
        states = {}
        actions = ['l', 'u', 'r', 'd']
        actions_v = [(-1, 0), (0, -1), (1, 0), (0, 1)]

        poss_actions = {actions[a]: {actions_v[a]: 1 - accident, actions_v[(a+1)%len(actions)]: accident/2, actions_v[(a-1)%len(actions)]: accident/2} for a in range(len(actions))}

        f = open(grid_file ,"r")
        file = f.read().split("\n")

        for line in range(len(file)):
            for char in range(len(file[line])):
                if file[line][char] is not 'x':
                    states[(char, line)] = {a: {tuple(map(sum, zip((char, line), p))): poss_actions[a][p] for p in poss_actions[a]} for a in poss_actions}

        for state in states:
            if file[state[1]][state[0]] == 's':

            for action_poss in state:
                for new_state in action_poss:
                    if file[new_state[1]][new_state[0]] == 'x':
                        action_poss[state] = actions_poss[new_state]
                        action_poss.remove(new_state)

        f.close()

        # super().__init(transition, reward, start_states)

if __name__=='__main__':
    yeuh = MDPGrid("grid1.txt", accident = 0.2)
