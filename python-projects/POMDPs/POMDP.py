import numpy as np
import math
import itertools

####################
#  MDP's
####################

class MDP():
    def __init__(self, transition, reward, start_states):
        self.transition = transition
        self.reward = reward
        self.start_states = start_states

        self.states = list(range(len(list(reward.values())[0])))
        self.actions = list(reward.keys())

        self.reset()

    def next(self, action):
        current_reward = self.reward[action][self.state]
        self.state = np.random.choice(self.states, p = self.transition[action][self.state])
        self.update_belief()

        return current_reward

    def reset(self):
        self.state = np.random.choice(self.start_states)
        self.update_belief()

    def update_belief(self):
        self.belief = np.zeros(len(self.states))
        self.belief[self.state] = 1



class POMDP(MDP):
    def __init__(self, transition, reward, observations, start_states, start_obs):
        super().__init__(transition, reward, start_states)

        self.observations = observations
        self.num_obs = len(list(observations.values())[0][0])


    def next(self, action):
        current_reward = self.reward[action][self.state]
        self.state = np.random.choice(self.states, p = self.transition[action][self.state])
        observed = np.random.choice(self.num_obs, p = self.observations[action][self.state])
        obs = self.observations[action].T[observed]

        self.belief = np.matmul(self.transition[action].T, self.belief)
        self.belief = normalize(np.multiply(self.belief, obs))

        return current_reward, observed

    def reset(self):
        super().reset()

        self.belief = np.zeros(len(self.states))
        for s in self.start_states: self.belief[s] = 1
        self.belief = normalize(self.belief)

        self.start_obs = start_obs



####################
#  Agents
####################

class RandomAgent():
    def __init__(self, mdp):
        self.mdp = mdp
        self.reset()

    def choose(self):
        old_obs = self.obs
        action = np.random.choice(self.mdp.actions)
        reward, self.obs = self.mdp.next(action)
        self.cumulative_reward += reward
        return old_obs, action, reward

    def reset(self):
        self.mdp.reset()
        self.cumulative_reward = 0
        self.obs = self.mdp.start_obs


class POMDPAgent():
    def __init__(self, mdp, gamma, transition = None, reward = None, policy = None, lookahead = 1, epsilon = 0):
        self.mdp = mdp
        self.gamma = gamma
        self.epsilon = epsilon

        self.o_transition = transition
        self.o_reward = reward
        self.o_policy = policy
        self.lookahead = lookahead

        self.optimal = False
        self.ugh = True

        self.reset_functions()
        self.n = 0

    def choose(self):
        self.choose_functions()

        old_belief = self.mdp.belief

        if not self.optimal:
            self.V_action_pi = {a: self.calc_V_action_pi(self.calc_V_pi(self.policy), [a]) for a in self.mdp.actions}

        if np.random.rand() < self.epsilon:
            action = np.random.choice(self.mdp.actions)
        else:
            if self.lookahead == 0:
                guess_state = np.random.choice(self.mdp.states, p = self.mdp.belief)
                action = self.policy[guess_state]
            else:
                # all_actions = list(itertools.product(self.mdp.actions, repeat=self.lookahead))
                action = self.mdp.actions[np.argmax([np.matmul(self.mdp.belief.T, self.V_action_pi[a]) for a in self.mdp.actions])]
        reward = self.mdp.next(action)

        self.update(old_belief, action, reward)

        return action, reward



    def choose_functions(self):
        if not self.o_transition:
            if self.epsilon == 0:
                self.transition = {a: np.asarray([normalize([self.beta2(self.transition_count[a][s], o) for o in self.mdp.states]) for s in self.mdp.states]) for a in self.mdp.actions}
            else:
                self.transition = {a: np.asarray([normalize(self.transition_count[a][s]) for s in self.mdp.states]) for a in self.mdp.actions}

        if not self.o_reward:
            if self.epsilon == 0:
                self.reward = {a: np.asarray([self.normal_num(self.reward_count[a][s]) for s in self.mdp.states]) for a in self.mdp.actions}
            else:
                self.reward = {a: np.asarray([self.reward_count[a][s][0]/max(self.reward_count[a][s][2],1e-10) for s in self.mdp.states]) for a in self.mdp.actions}

    def calc_V_pi(self, policy):
        P_pi = np.asarray([self.transition[policy[s]][s] for s in self.mdp.states])
        E_pi = np.asarray([self.reward[policy[s]][s] for s in self.mdp.states])
        return np.matmul(np.linalg.inv(np.identity(len(self.mdp.states)) - self.gamma * P_pi), E_pi)


    def update(self, old_belief, action, reward):
        self.cumulative_reward += reward

        self.transition_count[action] += np.outer(old_belief, self.mdp.belief).T
        self.reward_count[action] += np.asarray([old_belief*reward, old_belief*(reward**2), old_belief]).T

        new_policy = {}

        self.optimal = True
        self.n += 1

        for s in self.mdp.states:
            new_policy[s] = self.mdp.actions[np.argmax([self.V_action_pi[a][s] for a in self.mdp.actions])]
            if new_policy[s] != self.policy[s]:
                print(self.n,'suboptimal,',s,':',self.policy[s],'->',new_policy[s])
                self.optimal = False
            self.policy[s] = new_policy[s]

        if self.optimal and self.ugh:
            print('optimal!', self.policy)
            self.ugh = False


    def calc_V_action_pi(self, V_pi, actions):
        if not actions:
            return V_pi
        else:
            return self.reward[actions[0]] + self.gamma * np.matmul(self.transition[actions[0]], self.calc_V_action_pi(V_pi, actions[1:]))



    def beta2(self, x, y):
        a = x[y] + 1
        b = sum(x) - a + 2
        return np.random.beta(a,b)

    def normal_num(self, values):
        average = values[0]/max(values[2],1e-10)
        variance = values[1]/max(values[2],1e-10) - average**2
        return np.random.normal(average, math.sqrt(abs(variance)) + 1 / max(values[2], 1e-10))



    def reset(self):
        self.mdp.reset()
        self.cumulative_reward = 0

    def reset_functions(self):
        self.transition_count = {a: np.zeros((len(self.mdp.states), len(self.mdp.states))) for a in self.mdp.actions}
        self.reward_count = {a: [np.zeros(3) for s in self.mdp.states] for a in self.mdp.actions}

        # This is kind of a redundant step but hey whatever
        if self.o_transition: self.transition = self.o_transition
        if self.o_reward: self.reward = self.o_reward

        self.policy = {s: np.random.choice(self.mdp.actions) for s in self.mdp.states} if not self.o_policy else self.o_policy


class QLearningAgent():
    def __init__(self, mdp, gamma, alpha, epsilon, delta = 0):
        self.mdp = mdp
        self.gamma = gamma
        self.alpha = alpha
        self.epsilon = epsilon
        self.delta = delta

        self.reset()

    def choose(self):
        old_belief = self.mdp.belief

        if np.random.rand() < self.epsilon:
            action = np.random.choice(self.mdp.actions)
        else:
            action = self.mdp.actions[np.argmax(np.matmul(self.QValues.T, self.mdp.belief))]

        reward = self.mdp.next(action)

        self.update(old_belief, action, reward)

        return action, reward

    def update(self, old_belief, action, reward):
        self.cumulative_reward += reward

        a = self.mdp.actions.index(action)

        self.QValues[:,a] += self.alpha*(old_belief*(reward + self.gamma*np.matmul(self.mdp.belief,self.QValues.max(1))) - np.multiply(old_belief,self.QValues[:,a]))


    def reset(self):
        self.mdp.reset()
        self.cumulative_reward = 0

    def reset_functions(self):
        self.QValues = np.zeros((len(self.mdp.states), len(self.mdp.actions)))




def norm_mat(num):
    r = np.random.rand(num,num)
    return r / np.sum(r,axis=1)[:,None]

def norm_mat_2(col, row):
    r = np.random.rand(col, row)
    return r / np.sum(r,axis=1)[:,None]

def normalize(vector):
    return np.asarray(vector) / sum(vector) if sum(vector) != 0 else vector

if __name__ == '__main__':
    # rand = np.random.randint(200000)
    # np.random.seed(10)
    # actions = list(range(2))
    # num_states = 1000
    # num_obs = 100
    # start_states = list(range(num_states))
    # transition = {a: norm_mat(num_states) for a in actions}
    # reward = {a: np.asarray([np.random.normal() for s in range(num_states)]) for a in actions}
    # obs = {a: norm_mat_2(num_states,num_obs) for a in actions}
    # np.random.seed(rand)

    # num_states = 3
    # actions = ['slow','fast']
    # start_states = [0]
    # start_obs = 0
    # transition = {'slow': np.asarray([[1,0,0],[0.5,0.5,0],[0,0,1]]),
    #             'fast': np.asarray([[0.5, 0.5, 0],[0,0,1],[0,0,1]])}
    # reward = {'slow': np.asarray([1,1,0]),
    #         'fast': np.asarray([2,-10,0])}
    # obs = {'slow':np.asarray([[1,0],[1,0],[0,1]]),
    #     'fast':np.asarray([[1,0],[1,0],[0,1]])}

    # num_states = 3
    # actions = ['l','r']
    # start_states = list(range(num_states))
    # transition = {'l': np.asarray([[1,0,0],[0.5,0,0.5],[0,0.5,0.5]]),
    #             'r': np.asarray([[0,0.5,0.5],[0.5,0,0.5],[0,0,1]])}
    # reward = {'l': np.asarray([-1,1,0]),
    #         'r': np.asarray([0,1,-1])}
    # obs = {'l':np.asarray([[1,0],[0,1],[1,0]]),
    #     'r':np.asarray([[1,0],[0,1],[1,0]])}

    num_states = 2
    actions = ['open-left','open-right','listen']
    start_states = [0,1]
    start_obs = 2
    transition = {'open-left':np.asarray([[0.5,0.5],[0.5,0.5]]),
                'open-right':np.asarray([[0.5,0.5],[0.5,0.5]]),
                'listen':np.asarray([[1,0],[0,1]])}
    reward = {'open-left':np.asarray([-100,10]),
            'open-right':np.asarray([10,-100]),
            'listen':np.asarray([-1,-1])}
    obs = {'open-left':np.asarray([[0, 0, 1],[0, 0, 1]]),
        'open-right':np.asarray([[0, 0, 1],[0, 0, 1]]),
        'listen':np.asarray([[0.85,0.15, 0],[0.15,0.85, 0]])}

    # num_states = 4
    # actions = ['w0','e0']
    # start_states = [0,1,2]
    # transition = {'w0': np.asarray([[1,0,0,0],[1,0,0,0],[0,0,0,1],[1/3,1/3,1/3,0]]),
    #             'e0': np.asarray([[0,1,0,0],[0,0,0,1],[0,0,1,0],[1/3,1/3,1/3,0]])}
    # reward = {'w0': np.asarray([0,0,0,1]),
    #         'e0': np.asarray([0,0,0,1])}
    # obs = {'w0': np.asarray([[1,0],[1,0],[1,0],[0,1]]),
    #     'e0': np.asarray([[1,0],[1,0],[1,0],[0,1]])}

    myAgent = RandomAgent(POMDP(transition, reward, obs, start_states, start_obs))

    for t in range(100):
        myAgent.reset()
        for i in range(100):
            print(myAgent.choose())
        print(myAgent.cumulative_reward)


    # print(myAgent.policy)
    # print({a: myAgent.transition_count[a].astype(int) for a in myAgent.transition})
    # print({a: np.around(myAgent.transition[a], decimals=2) for a in myAgent.transition})
    # print({a: np.around(transition[a], decimals=2) for a in transition})

def getX(a, b, c, d):
    return 1 / (1 - (a - c)/(b - d))
