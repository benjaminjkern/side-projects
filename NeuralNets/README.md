# Neural Nets
*By Ben Kern*

## Info
A Small custom-built library for plugging NeuralNets in to games, included so far is a simple bot fighting game. They evolve and learn to fight each other better with each generation.

Included is a custom-built library for Linear Algebra within Java that acts upon native Java arrays rather than create a new wrapper class for matrices and whatnot. It's kinda cool.

### What's new!
- I hated the way that it was figuring out who is best, so I implemented a tournament sort instead of a points based system, though I still have the points based system implemented if I end up making more games this will be easier to work with.
- I added a bit of Rigid body physics that is used in the game, I'm gonna make obstacles eventually but I'm getting sick of using this thought experiment and I wanna do other things soon

### Usage
Run "FightingGame.jar" file to run program
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
