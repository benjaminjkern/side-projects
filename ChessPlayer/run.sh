#!/bin/bash
clear
cd $(dirname $0)
cd ..
javac -d classfiles chessplayer/ChessGame.java
java -cp classfiles chessplayer/ChessGame
