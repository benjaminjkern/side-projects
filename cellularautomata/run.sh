#!/bin/bash
clear
cd $(dirname $0)
cd ..
javac -d classfiles cellularautomata/CellularAutomata.java
java -cp classfiles cellularautomata/CellularAutomata
