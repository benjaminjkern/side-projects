#pragma once
#include "constants.hpp"
#include <SFML/Graphics.hpp>

using namespace sf;
class Ball {
  private:
    Vector2f position;
    Vector2f velocity;
    CircleShape shape;
    float radius;

  public:
    Ball();
    void update();
    void draw(RenderWindow *window);
};