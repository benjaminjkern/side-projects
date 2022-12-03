#include "Ball.hpp"
#include <SFML/Graphics.hpp>
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

int main() {
    srand(time(NULL));
    sf::RenderWindow window(sf::VideoMode(windowWidth, windowHeight),
                            "SFML Application");

    std::vector<Ball> balls;

    for (int i = 0; i < 10000; i++) {
        balls.push_back(Ball());
    }

    sf::Clock clock;
    FpsHandler fpsHandler;

    while (window.isOpen()) {
        clock.restart();
        sf::Event event;

        while (window.pollEvent(event))
            if (event.type == sf::Event::Closed)
                window.close();

        window.clear();
        for (auto &ball : balls) {
            ball.update();
            ball.draw(&window);
        }

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

        window.display();
    }
}
