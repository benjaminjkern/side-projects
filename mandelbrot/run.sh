#!/bin/bash
clear
cd $(dirname $0)
cd ..
javac -d classfiles mandelbrot/Mandelbrot.java
java -cp classfiles mandelbrot/Mandelbrot
