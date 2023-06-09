#include "constants.hpp"
#include <SFML/Graphics.hpp>
#include <cmath>
#include <iostream>
#include <vector>

int main() {
    sf::RenderWindow window(sf::VideoMode(windowWidth, windowHeight), "3D");

    sf::Uint8 *pixels = new sf::Uint8[windowWidth * windowHeight * 4];
    sf::Texture texture;
    texture.create(windowWidth, windowHeight);
    sf::Sprite sprite(texture);

    sf::Clock clock;
    while (window.isOpen()) {
        clock.restart();
        sf::Event event;

        while (window.pollEvent(event)) {
            if (event.type == sf::Event::Closed) {
                window.close();
                return 0;
            }
        }

        window.clear();

        texture.update(pixels);
        window.draw(sprite);
        window.display();

        auto elapsedTime = clock.getElapsedTime();
        if (LIMIT_FRAMERATE) {
            auto timeToWait = sf::seconds(1. / FPS) - elapsedTime;
            if (timeToWait.asMicroseconds() >= 0) {
                sleep(timeToWait);
                elapsedTime = sf::seconds(1. / FPS);
            }
        }
    }
}
