# Mandelbrot Set plotter
*By Ben Kern*

## Info
The Mandelbrot set is a mathematical construct that illustrates complex fractals that arise from a chaotic recursive simple math function.

Here's a link! [CLICK ME PLS](https://en.wikipedia.org/wiki/Mandelbrot_set)

### What's new!
- Animation! You can edit the program to have a starting zoom, an ending zoom, and however many frames you want it to render!
  - It will then iteratively generate the proper pictures of the mandelbrot set
- There's a bug where the animation slows down your computer from some infinite loop that I'll figure out at some point

### Usage
It just sorta does its own thing, any customization you might want to do at the moment has to be done by altering the code which isn't something that bugs me too much obvious since I made it but ideally this will be something that I can give to anyone and they'll be able to check out how cool I am I mean how cool the project is.

In the code there is a portion that goes like:
```
    public static void main(String... args) throws InterruptedException {
        m = new Mandelbrot(600,600, 0, 0, 2);
        m.go()
    }
```
The `Mandelbrot()` constructor is to be used as follows:
```
Mandelbrot([width of JFrame],
           [height of JFrame],
           [in-simulation x coordinate of center of JFrame],
           [in-simulation y coordinate of center of JFrame],
           [starting zoom (i.e. in-simulation distance from center of screen to edge of JFrame],
           [ending zoom],
           [# of frames you want animated])
```
Just change the paramters if you wanna see a different picture! I promise I'll work on making it more user friendly but hey initial upload it works for me

- **[A]**: Tab back a frame, this will pause the calculation of the current frame.
- **[D]**: Tab forward a frame, if you are at the furthest forward frame then it will continue the calculation.

### Cool things so far
- An animation that can zoom in and out of your desired point on the mandelbrot set (or another set if chosen to do so)
- Cool colors!
- Imaginary Number arithmetic allows for creation of alternative mandelbrot sets (Again with some alteration of the code but not a whole lot because the groundworks are already there!)
  - *z → z^n*
  - Julia sets!

### To do List
- Add more user settings! (So that it's not locked and can actually accurately show how this concept works)
  - Different color choices
    - There's another form of coloring that is more gradient than the way it is right now and I've been meaning to figure out       how to do that
  - Add control of where the picture will be on the set
- Allow for greater precision
