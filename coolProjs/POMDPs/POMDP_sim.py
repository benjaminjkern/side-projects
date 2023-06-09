import numpy as np
import plotly as py
import plotly.graph_objs as go
import multiprocessing
from plotly import tools
from joblib import Parallel, delayed
from POMDP import *
import random
import itertools

# ----------------------------------------------------------------
# Simulation Parameters
# ----------------------------------------------------------------

# Configure simulation
SIM_NAME = "pomdp_sims"
N        = 100     # Number of Monte Carlo Repetitions
T        = 100    # Number of trials per MC
S        = 50
N_CORES  = multiprocessing.cpu_count()-1

# TIGER POMDP
# num_states = 2
# actions = ['open-left','open-right','listen']
# start_states = [0,1]
# transition = {'open-left':np.asarray([[0.5,0.5],[0.5,0.5]]),
#             'open-right':np.asarray([[0.5,0.5],[0.5,0.5]]),
#             'listen':np.asarray([[1,0],[0,1]])}
# reward = {'open-left':np.asarray([-100,10]),
#         'open-right':np.asarray([10,-100]),
#         'listen':np.asarray([-1,-1])}
# obs = {'open-left':np.asarray([[0.5,0.5],[0.5,0.5]]),
#     'open-right':np.asarray([[0.5,0.5],[0.5,0.5]]),
#     'listen':np.asarray([[0.85,0.15],[0.15,0.85]])}

# Michael's 1D maze
# num_states = 4
# actions = ['w0','e0']
# start_states = [0,1,2]
# transition = {'w0': np.asarray([[1,0,0,0],[1,0,0,0],[0,0,0,1],[1/3,1/3,1/3,0]]),
#             'e0': np.asarray([[0,1,0,0],[0,0,0,1],[0,0,1,0],[1/3,1/3,1/3,0]])}
# reward = {'w0': np.asarray([0,0,0,1]),
#         'e0': np.asarray([0,0,0,1])}
# obs = {'w0': np.asarray([[1,0],[1,0],[1,0],[0,1]]),
#     'e0': np.asarray([[1,0],[1,0],[1,0],[0,1]])}



# COUNFOUNDED CAR
num_states = 3
actions = ['slow','fast']
start_states = [0]
transition = {'slow': np.asarray([[1,0,0],[0.5,0.5,0],[0,0,1]]),
            'fast': np.asarray([[0.5, 0.5, 0],[0,0,1],[0,0,1]])}
reward = {'slow': np.asarray([1,1,0]),
        'fast': np.asarray([2,-10,0])}
obs = {'slow':np.asarray([[1,0],[1,0],[0,1]]),
    'fast':np.asarray([[1,0],[1,0],[0,1]])}


# MINI_MAZE
# num_states = 3
# actions = ['l','r']
# start_states = list(range(num_states))
# transition = {'l': np.asarray([[1,0,0],[0.5,0,0.5],[0,0.5,0.5]]),
#             'r': np.asarray([[0,0.5,0.5],[0.5,0,0.5],[0,0,1]])}
# reward = {'l': np.asarray([-1,1,0]),
#         'r': np.asarray([0,1,-1])}
# obs = {'l':np.asarray([[1,0],[0,1],[1,0]]),
#       'r':np.asarray([[1,0],[0,1],[1,0]])}


# actions = list(range(10))
# num_states = 10
# num_obs = 5
# start_states = list(range(num_states))
# transition = {a: norm_mat(num_states) for a in actions}
# reward = {a: np.asarray([np.random.normal() for s in range(num_states)]) for a in actions}
# obs = {a: norm_mat_2(num_states,num_obs) for a in actions}

print(transition)
print(reward)
print(obs)

# policy = {s: np.random.choice(actions) for s in list(range(num_states))}

#All possible policies??
num_policies = 1

if num_policies >= len(actions)**num_states:
    num_policies = len(actions)**num_states
    policies = [{s: actions[math.floor(r / len(actions)**s) % len(actions)] for s in list(range(num_states))} for r in list(range(len(actions)**num_states))]
else:
    policies = [{s: np.random.choice(actions) for s in list(range(num_states))} for t in range(num_policies)]

lookaheads = [0, 1]

# Initialize learning agents; change these based on what the spec
# asks you to plot on any given problem
agents = [
    POMDPAgent(POMDP(transition, reward, start_states, obs), 0.999, lookahead = 1, transition = transition, reward = reward),
    POMDPAgent(POMDP(transition, reward, start_states, obs), 0.999, lookahead = 1, epsilon = 0.2),
    POMDPAgent(POMDP(transition, reward, start_states, obs), 0.999, lookahead = 1, epsilon = 0.1),
    POMDPAgent(POMDP(transition, reward, start_states, obs), 0.999, lookahead = 1, epsilon = 0.01),
    POMDPAgent(POMDP(transition, reward, start_states, obs), 0.999, lookahead = 1, epsilon = 0.001)
]

# Change these to describe the agents being compared in a given
# simulation
ag_names = [
    "Fully-Specified Agent",
    "Learn-Probabilites Agent, e=0.2",
    "Learn-Probabilites Agent, e=0.1",
    "Learn-Probabilites Agent, e=0.01",
    "Learn-Probabilites Agent, e=0.001",
]
# Colors for the graphs (you don't need to change these unless
# you're an art snob)
ag_colors = [
    ('rgb('+str(np.random.randint(256))+','+str(np.random.randint(256))+','+str(np.random.randint(256))+')') for a in agents
]
AG_COUNT = len(agents)



# ----------------------------------------------------------------
# Simulation Functions
# ----------------------------------------------------------------
def run_sim ():
    '''
    Runs a single MC iteration of the simulation consisting of T trials.
    '''

    ag_reg = np.zeros((AG_COUNT, T))
    ag_opt = np.zeros((AG_COUNT, T))

    for a in agents:
        a.reset_functions()

    for t in range(T):
        max_reward = -float('inf')
        for a_ind, ag in enumerate(agents):
            ag.reset()
            for s in range(S):
                action, reward = ag.choose()

            if ag.cumulative_reward > max_reward:
                max_reward = ag.cumulative_reward

            ag_opt[a_ind, t] += ag.cumulative_reward

        for a_ind, ag in enumerate(agents):
            ag_reg[a_ind, t] += max_reward - ag.cumulative_reward

    return [ag_reg, ag_opt]

def gen_graph (cum_reg, cum_opt, names, colors):
    '''
    Reporting mechanism that generates graphical reports on the
    probability that each agent takes the optimal action and the
    agent's cumulative regret, both as a function of the current
    trial
    '''
    AG_COUNT = cum_reg.shape[0]
    traces = []
    fig = tools.make_subplots(rows=1, cols=2, subplot_titles=('Reward per Episode', 'Cumulative Regret'))
    fig['layout']['xaxis1'].update(title='Episode', range=[0, T])
    fig['layout']['xaxis2'].update(title='Episode', range=[0, T])
    fig['layout']['yaxis1'].update(title='Reward per Episode')
    fig['layout']['yaxis2'].update(title='Cumulative Regret')

    # Plot cumulative regret
    for a in range(AG_COUNT):
        trace = go.Scatter(
            x = list(range(T)),
            y = cum_opt[a, :],
            line = dict(
                color = colors[a]
            ),
            name = names[a]
        )
        fig.append_trace(trace, 1, 1)

    # Plot optimal arm choice
    for a in range(AG_COUNT):
        trace = go.Scatter(
            x = list(range(T)),
            y = cum_reg[a, :],
            line = dict(
                color = colors[a]
            ),
            name = names[a] + ' [REG]',
            showlegend = False
        )
        fig.append_trace(trace, 1, 2)

    py.offline.plot(fig, filename=("./cum_reg_" + SIM_NAME + ".html"))


if __name__ == '__main__':
    print("=== MDP Simulations Beginning ===")

    # Record-keeping data structures across MC simulations
    round_reg = np.zeros((AG_COUNT, T))
    round_opt = np.zeros((AG_COUNT, T))
    cum_reg = np.zeros((AG_COUNT, T))

    # MAIN WORKHORSE - Runs MC repetitions of simulations in parallel:
    sim_results = Parallel(n_jobs=N_CORES, verbose=10)(delayed(run_sim)() for i in range(N))
    for (ind, r) in enumerate(sim_results):
        round_reg += r[0]
        round_opt += r[1]

    # Reporting phase:
    for a in range(AG_COUNT):
        cum_reg[a] = np.array([np.sum(round_reg[a, 0:i+1]) for i in range(T)])
    cum_reg = cum_reg / N
    cum_opt = round_opt / N
    gen_graph(cum_reg, cum_opt, ag_names, ag_colors)

    print("[!] Simulations Completed")
