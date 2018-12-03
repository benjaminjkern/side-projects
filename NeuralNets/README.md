# Neural Nets
*By Ben Kern*

## Info
A Small custom-built library for plugging NeuralNets in to games, included so far is a simple bot fighting game. They evolve and learn to fight each other better with each generation.

Included is a custom-built library for Linear Algebra within Java that acts upon native Java arrays rather than create a new wrapper class for matrices and whatnot. It's kinda cool.

### What's new!
Basically nothing, hahahaha. At least not from a simulator standpoint, but behind the scenes I did quite a bit
- Cleaned up lots-o-code
- NeuralNet, Game, and Population class were made more general and more usable for plugging in to other projects
  - Speaking of, Game got a big revamp that I might turn in to a separate project
    - It now has a full implementation of linear algebra operations that is friendly with native Java double arrays, which is cool and makes the implementation of the NeuralNet itself look sooooo clean and nice
- Got rid of the Main class cuz it was annoying, it runs through AISimulation.java now


### Usage
Run "AIFightingGame" file to run program
- [SPACE] : Toggle sped up simulation
- [A] : Toggle stats screen
- [W/S] : Switch what is showing on stats screen
- [P] : Toggle pause simulation


### To Do List
##### Specifics
- Explain what each stats screen chart is displaying
- Add ability to see Nets at work
- Add settings that aren't set within the code
  - Change NeuralNets' hyperparameters as well as the population parameters
- Add ability for human to take control of bot and fight a trained bot

##### Bigger picture/bigger projects to do's
- Implement other games and flesh out the easiness of being able to plug in control over those games
  - I would probably do Chess since that's another project I have
  - Other options include a racing game, a top down tank game that I haven't fully made yet, NLP (Just to say I did it)
- Big one: Formulate a "quasi-machine learning" algorithm that allows for the neural nets to learn faster than random evolution, I realize this is something that hasn't been solved yet but I can take a stab at it.
