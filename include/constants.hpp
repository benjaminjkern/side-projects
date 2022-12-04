#pragma once
#include <SFML/Graphics.hpp>

const float GRAVITY = 0;
const int windowWidth = 1280;
const int windowHeight = 960;
const int pixelSize = 5;
const int gridWidth = windowWidth / pixelSize;
const int gridHeight = windowHeight / pixelSize;

const int FPS = 120;
const bool LIMIT_FRAMERATE = true;
const bool DRAW_FPS = true;