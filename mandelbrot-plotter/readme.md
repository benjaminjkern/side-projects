# Mandelbrot Set plotter
*By Ben Kern*

## Info
The Mandelbrot set is a mathematical construct that illustrates complex fractals that arise from a chaotic recursive simple math function.

Here's a link! [CLICK ME PLS](https://en.wikipedia.org/wiki/Mandelbrot_set)

### Usage
Don't do anything lol it just does its thing, any customization you might want to do at the moment has to be done by altering the code which isn't something that bugs me too much, in the code there is a portion that goes like:
```
    public static void main(String... args) {
        m = new Mandelbrot(720, 720, -0.15920209459934798, 1.0225993850457615, 1e-13);
        m.go();
    }
```
The `Mandelbrot()` constructor is to be used as follows:
```
Mandelbrot([width of JFrame],
           [height of JFrame],
           [in-simulation x coordinate of center of JFrame],
           [in-simulation y coordinate of center of JFrame],
           [zoom (i.e. in-simulation distance from center of screen to edge of JFrame])
```
Just change the paramters if you wanna see a different picture! I promise I'll work on making it more user friendly but hey initial upload it works for me

### Cool things so far
- Cool colors!
- Imaginary Number arithmetic allows for creation of alternative mandelbrot sets (Again with some alteration of the code but not a whole lot because the groundworks are already there!)
  - *z → z^n*
  - Julia sets!
              

### To do List
- Add more user settings! (So that it's not locked and can actually accurately show how this concept works)
  - Different color choices
    - There's another form of coloring that is more gradient than the way it is right now and I've been meaning to figure out       how to do that
  - Add control of where the picture will be on the set
- *Big one that I actually will definitely do when I get time to do it*: Give a start zoom and an end zoom, and it will generate images that can be put in to a zoom video. I've always wanted to do it
- Allow for greater precision at the cost of time to simulate
- Clean up code
