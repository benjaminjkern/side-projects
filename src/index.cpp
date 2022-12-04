#include "Ball.hpp"
#include <SFML/Graphics.hpp>
#include <iostream>
#include <vector>

const float randomNum2() { return ((float)rand() / (float)RAND_MAX); }

const int getPixel(int i, int dx, int dy) {
    int x = i % (windowWidth / pixelSize);
    int y = i / (windowWidth / pixelSize);

    int nx = (x + dx + (windowWidth / pixelSize)) % (windowWidth / pixelSize);
    int ny = (y + dy + (windowHeight / pixelSize)) % (windowHeight / pixelSize);

    return nx + (windowWidth / pixelSize) * ny;
}

const int doRule(int neighborCount, int currentValue) {
    if (currentValue == 1)
        return neighborCount == 2 || neighborCount == 3;
    return neighborCount == 3;
}

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
    sf::Uint8 *opixels =
        new sf::Uint8[windowWidth * windowHeight / pixelSize / pixelSize];
    sf::Uint8 *rpixels =
        new sf::Uint8[windowWidth * windowHeight / pixelSize / pixelSize];
    sf::Texture texture;
    texture.create(windowWidth, windowHeight);
    sf::Sprite sprite(texture);

    for (int i = 0; i < windowWidth * windowHeight / pixelSize / pixelSize;
         i++) {
        opixels[i] = randomNum2() * 2;
        rpixels[i] = opixels[i];
    }

    for (int i = 0; i < windowWidth * windowHeight / pixelSize / pixelSize;
         i++) {
        for (int x = 0; x < pixelSize; x++) {
            for (int y = 0; y < pixelSize; y++) {
                int index =
                    pixelSize * (i % (windowWidth / pixelSize)) + x +
                    windowWidth *
                        (pixelSize * (i / (windowWidth / pixelSize)) + y);

                pixels[4 * index] = opixels[i] * 255;
                pixels[4 * index + 1] = opixels[i] * 255;
                pixels[4 * index + 2] = opixels[i] * 255;
                pixels[4 * index + 3] = 255;
            }
        }
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
        // for (auto &ball : balls) {
        //     ball.update();
        //     ball.draw(&window);
        // }

        for (int i = 0; i < windowWidth * windowHeight / pixelSize / pixelSize;
             i++) {
            int neighborTotal =
                opixels[getPixel(i, 0, 1)] + opixels[getPixel(i, 0, -1)] +
                opixels[getPixel(i, 1, 1)] + opixels[getPixel(i, 1, -1)] +
                opixels[getPixel(i, -1, 1)] + opixels[getPixel(i, -1, -1)] +
                opixels[getPixel(i, 1, 0)] + opixels[getPixel(i, -1, 0)];
            rpixels[i] = doRule(neighborTotal, opixels[i]);
        }

        for (int i = 0; i < windowWidth * windowHeight / pixelSize / pixelSize;
             i++) {
            opixels[i] = rpixels[i];
            for (int x = 0; x < pixelSize; x++) {
                for (int y = 0; y < pixelSize; y++) {
                    int index =
                        pixelSize * (i % (windowWidth / pixelSize)) + x +
                        windowWidth *
                            (pixelSize * (i / (windowWidth / pixelSize)) + y);

                    pixels[4 * index] = opixels[i] * 255;
                    pixels[4 * index + 1] = opixels[i] * 255;
                    pixels[4 * index + 2] = opixels[i] * 255;
                }
            }
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
