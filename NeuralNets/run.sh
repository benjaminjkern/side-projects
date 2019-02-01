#!/bin/bash
clear
cd $(dirname $0)
cd ..
javac -d classfiles neuralnets/AIFightingGame.java
java -cp classfiles neuralnets/AIFightingGame
