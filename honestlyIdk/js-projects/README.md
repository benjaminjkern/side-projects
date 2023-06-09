# JavaScript Projects
> By Ben Kern

These are the projects I made using node.js. Again, mostly proof of concepts, but the ones here I thought were cool enough to share with the internet.

## Lambda/Lambda++
A Programming Language that fully implements Lamdba Calculus, with Lambda++ being a deliberate improvement upon basic lambda calculus that attempts to make it viable for real programming. There's a readme in there that explains it a bit better.

## blackjackOdds.js
Plug in your current hand in blackjack as well as what you know about all shown cards on the table, and this program will tell you whether or not to hit! It will also tell you your likelihood of winning.

This one is cool because it also works with limited information, which doesn't actually stretch to a real blackjack game, but it does let you calculate your odds of winning blackjack in every possible situation! (As it turns out, even if you play optimally you still lose more than half the time. I thought this was really interesting but also I wasn't super surprised, casinos can't just be giving out their money!)

## calcDice.js
Input the number of dice, as well as the range of what the dice can roll (A standard dice rolls numbers from 1-6), and it will give you a distribution of what sums of dice values are possible. As far as I know, this doesn't have a trivial solution, but it does have a neat recursive solution!

## zeroFinder.js
You can put in any polynomial (in the form of an array of coefficients, where the n-index of the array corresponds to the nth power of the polynomial), and this will find all real zeros of this polynomial.
