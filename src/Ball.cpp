#pragma once
#include <SFML/Graphics.hpp>

using namespace sf;
class Ball {
  private:
    Vector2f position;
    Vector2f velocity;
    CircleShape shape;

  public:
    Ball();
    void update();
};