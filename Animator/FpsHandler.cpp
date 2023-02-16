#include <SFML/Graphics.hpp>
#include <cmath>
#include <iostream>
#include <vector>

class FpsHandler {
  private:
    sf::Text text;
    sf::Font font;

  public:
    FpsHandler() {
        if (!font.loadFromFile("assets/Arial.ttf")) {
            std::cout << "Couldn't find font!" << std::endl;
        }
        text.setFont(font);
        text.setCharacterSize(10);
    }
    void drawFps(sf::RenderWindow *window, sf::Time elapsedTime) {
        text.setString("fps: " +
                       std::to_string((int)(1 / elapsedTime.asSeconds())));
        (*window).draw(text);
    }
};
sf::Clock clock;
FpsHandler fpsHandler;

clock.restart();

auto elapsedTime = clock.getElapsedTime();
if (LIMIT_FRAMERATE) {
    auto timeToWait = sf::seconds(1. / FPS) - elapsedTime;
    if (timeToWait.asMicroseconds() >= 0) {
        sleep(timeToWait);
        elapsedTime = sf::seconds(1. / FPS);
    }
}
if (DRAW_FPS)
    fpsHandler.drawFps(&window, elapsedTime);
