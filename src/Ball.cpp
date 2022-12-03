#include "Ball.hpp"
#include <iostream>

float randomNum() { return ((float)rand() / (float)RAND_MAX); }

Ball::Ball() {
    radius = 40;
    shape.setRadius(radius);
    position.x = randomNum() * windowWidth;
    position.y = randomNum() * windowHeight;
    velocity.x = randomNum() * 2 - 1;
    velocity.y = randomNum() * 2 - 1;
    // std::cout << velocity.x << "," << velocity.y << std::endl << std::endl;
    shape.setPosition(position - Vector2f(radius, radius));
    shape.setFillColor(
        sf::Color(randomNum() * 256, randomNum() * 256, randomNum() * 256));
}

void Ball::update() {
    position += velocity;
    // std::cout << position.x << "," << position.y << std::endl;

    if (position.x > windowWidth || position.x < 0) {
        velocity.x = -velocity.x;
        position.x += velocity.x;
    }
    if (position.y > windowHeight || position.y < 0) {
        velocity.y = -velocity.y;
        position.y += velocity.y;
    }
    shape.setPosition(position - Vector2f(radius, radius));
}

void Ball::draw(RenderWindow *window) { (*window).draw(shape); }