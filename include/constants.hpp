#pragma once
#include <SFML/Graphics.hpp>

const float GRAVITY = 0;
const int windowWidth = 168 * 2;
const int windowHeight = 105 * 2;
const int pixelSize = 1;
const int gridWidth = windowWidth / pixelSize;
const int gridHeight = windowHeight / pixelSize;

const int FPS = 120;
const bool LIMIT_FRAMERATE = true;
const bool DRAW_FPS = false;