#pragma once
#include <SFML/Graphics.hpp>

const int windowWidth = 168 * 4;
const int windowHeight = 105 * 4;
const int pixelSize = 2;
const int gridWidth = windowWidth / pixelSize;
const int gridHeight = windowHeight / pixelSize;

const int FPS = 120;
const bool LIMIT_FRAMERATE = true;
const bool DRAW_FPS = false;