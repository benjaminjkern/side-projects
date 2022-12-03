#include "Ball.hpp"
#include <SFML/Graphics.hpp>
#include <iostream>
#include <vector>

const float randomNum2() { return ((float)rand() / (float)RAND_MAX); }

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

    // for (int i = 0; i < 10000; i++) {
    //     balls.push_back(Ball());
    // }

    sf::Uint8 *pixels = new sf::Uint8[windowWidth * windowHeight * 4];
    sf::Texture texture;
    texture.create(windowWidth, windowHeight);
    sf::Sprite sprite(texture);
    // // Make the top-left pixel transparent
    // sf::Color color = image.getPixel(0, 0);
    // color.a = 0;
    // image.setPixel(0, 0, color);

    sf::Clock clock;
    FpsHandler fpsHandler;

    while (window.isOpen()) {
        clock.restart();
        sf::Event event;

        while (window.pollEvent(event))
            if (event.type == sf::Event::Closed)
                window.close();

        window.clear();
        // for (auto &ball : balls) {
        //     ball.update();
        //     ball.draw(&window);
        // }

        for (int i = 0; i < windowWidth * windowHeight; i++) {
            pixels[4 * i] = randomNum2() * 255;
            pixels[4 * i + 1] = randomNum2() * 255;
            pixels[4 * i + 2] = randomNum2() * 255;
            pixels[4 * i + 3] = 255;
        }
        texture.update(pixels);
        window.draw(sprite);

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
