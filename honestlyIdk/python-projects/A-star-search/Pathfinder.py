'''


@author: ~ Ben Kern ~

A* Search Algorithm

Done for Artificial Intelligence, Taught by Professor Forney


The Pathfinder class is responsible for finding a solution (i.e., a
sequence of actions) that takes the agent from the initial state to all
of the goals with optimal cost.

This task is done in the solve method, as parameterized
by a maze pathfinding problem, and is aided by the SearchTreeNode DS.


'''

from MazeProblem import MazeProblem
from SearchTreeNode import SearchTreeNode
from collections import deque
import unittest
from json.encoder import INFINITY


def getSolution(node):
    soln = []
    while node.parent is not None:
        soln.append(node.action)
        node = node.parent
    soln.reverse()
    return soln


def getHeuristicCost(state, listOfGoals):
    hScore = 1000
    for goal in listOfGoals:
        gHeuristic = MazeProblem.manhattanDist(state, goal)
        if (gHeuristic < hScore):
            hScore = gHeuristic
    return hScore

class Pathfinder:

    def solve(problem, initial, goals):

        solution = []

        sortedGoals = set()
        sortedGoals.update(goals)

        # put current at root, not in openSet

        openSet = []
        closedSet = set()
        current = SearchTreeNode(initial, None, None, 0, getHeuristicCost(initial, sortedGoals))

        while not len(sortedGoals) == 0:

            # Search!
            while not current.state in sortedGoals:

                closedSet.add(current.state)

                # Generate new nodes on frontier
                for (action, cost, state) in problem.transitions(current.state):

                    # Don't go back to the state you just came from ya goose!
                    if (state in closedSet):
                        continue

                    hScore = getHeuristicCost(current.state, sortedGoals)
                    gScore = current.totalCost + cost

                    # iterate through openSet and put new untraversed nodes in based on f(n) = g(n) + h(n)
                    index = 0
                    while index < len(openSet):
                        if (gScore + hScore < openSet[index].totalCost + openSet[index].heuristicCost):
                            break
                        index += 1
                    openSet.insert(index, SearchTreeNode(state, action, current, gScore, hScore))

                # If it runs out of nodes, its not possible
                if (len(openSet) == 0):
                    print('not possible')
                    return None

                # Get the lowest score in the openSet
                current = openSet[0]
                del openSet[0]

            # FOUND A GOAL WOO ADD THE STEPS IT TOOK TO DO THAT TO THE SOLUTION

            solution.extend(getSolution(current))
            sortedGoals.remove(current.state)

            openSet = []
            closedSet = set()
            current = SearchTreeNode(current.state, None, None, 0, getHeuristicCost(current.state, sortedGoals))

        print(solution)
        return solution



class PathfinderTests(unittest.TestCase):

    def test_maze1(self):
        maze = ["XXXXXXX",
                "X.....X",
                "X.M.M.X",
                "X.X.X.X",
                "XXXXXXX"]
        problem = MazeProblem(maze)
        initial = (1, 3)
        goals   = [(5, 3)]
        soln = Pathfinder.solve(problem, initial, goals)
        (soln_cost, is_soln) = problem.soln_test(soln, initial, goals)
        self.assertTrue(is_soln)
        self.assertEqual(soln_cost, 8)

    def test_maze2(self):
        maze = ["XXXXXXX",
                "X.....X",
                "X.M.M.X",
                "X.X.X.X",
                "XXXXXXX"]
        problem = MazeProblem(maze)
        initial = (1, 3)
        goals   = [(3, 3),(5, 3)]
        soln = Pathfinder.solve(problem, initial, goals)
        (soln_cost, is_soln) = problem.soln_test(soln, initial, goals)
        self.assertTrue(is_soln)
        self.assertEqual(soln_cost, 12)

    def test_maze3(self):
        maze = ["XXXXXXX",
                "X.....X",
                "X.M.MMX",
                "X...M.X",
                "XXXXXXX"]
        problem = MazeProblem(maze)
        initial = (5, 1)
        goals   = [(5, 3), (1, 3), (1, 1)]
        soln = Pathfinder.solve(problem, initial, goals)
        (soln_cost, is_soln) = problem.soln_test(soln, initial, goals)
        self.assertTrue(is_soln)
        self.assertEqual(soln_cost, 12)

    def test_maze4(self):
        maze = ["XXXXXXX",
                "X.....X",
                "X.M.XXX",
                "X...X.X",
                "XXXXXXX"]
        problem = MazeProblem(maze)
        initial = (5, 1)
        goals   = [(5, 3), (1, 3), (1, 1)]
        soln = Pathfinder.solve(problem, initial, goals)
        self.assertTrue(soln == None)


    def test_maze5(self):
        maze = ["XXXXXXXXXXXX",
                "X.MMMMMMMM.X",
                "X.XXXXXXXX.X",
                "X.X...X....X",
                "X.X.X.X.XMXX",
                "X...X...X..X",
                "XXXXXXXXXXXX"]
        problem = MazeProblem(maze)
        initial = (1, 1)
        goals   = [(10, 1), (10, 5)]
        soln = Pathfinder.solve(problem, initial, goals)
        (soln_cost, is_soln) = problem.soln_test(soln, initial, goals)
        self.assertTrue(is_soln)
        self.assertEqual(soln_cost, 29)


    def test_maze6(self):
        maze = ["XXXXXXXXXXXX",
                "X.MMMMMMMM.X",
                "X.XXXXXXXX.X",
                "X.X...X....X",
                "X.X.X.X.XXXX",
                "X...X...X..X",
                "XXXXXXXXXXXX"]
        problem = MazeProblem(maze)
        initial = (1, 1)
        goals   = [(10, 1), (10, 5)]
        soln = Pathfinder.solve(problem, initial, goals)
        self.assertTrue(soln == None)


    def test_maze7(self):
        maze = ["XXXXXXXXXXXX",
                "X.MMMMMMMM.X",
                "X.MMMMMMMM.X",
                "X.M...M....X",
                "X.M.M.M.MMMX",
                "X...M...M..X",
                "XXXXXXXXXXXX"]
        problem = MazeProblem(maze)
        initial = (1, 1)
        goals   = [(10, 1), (10, 5)]
        soln = Pathfinder.solve(problem, initial, goals)
        (soln_cost, is_soln) = problem.soln_test(soln, initial, goals)
        self.assertTrue(is_soln)
        print(soln_cost)
        self.assertEqual(soln_cost, 23)


if __name__ == '__main__':
    unittest.main()
