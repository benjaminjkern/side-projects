#include "Ball.hpp"
#include <SFML/Graphics.hpp>
#include <iostream>
#include <vector>

#include <unordered_set>

const float randomNum2() { return ((float)rand() / (float)RAND_MAX); }

const int getPixel(int i, int dx, int dy) {
    int x = i % (windowWidth / pixelSize);
    int y = i / (windowWidth / pixelSize);

    int nx = (x + dx + (windowWidth / pixelSize)) % (windowWidth / pixelSize);
    int ny = (y + dy + (windowHeight / pixelSize)) % (windowHeight / pixelSize);

    return nx + (windowWidth / pixelSize) * ny;
}

class Rule {
  private:
    std::vector<int> constants;

  public:
    Rule() {}
    float doRule(int neighborCount, int currentValue) { return 0; }
};

void writeValuesToPixels(float *values, sf::Uint8 *pixels) {
    for (int i = 0; i < gridWidth * gridHeight; i++) {
        for (int x = 0; x < pixelSize; x++) {
            for (int y = 0; y < pixelSize; y++) {
                int index = pixelSize * (i % gridWidth) + x +
                            windowWidth * (pixelSize * (i / gridWidth) + y);
                pixels[4 * index] = values[3 * i] * 255;
                pixels[4 * index + 1] = values[3 * i + 1] * 255;
                pixels[4 * index + 2] = values[3 * i + 2] * 255;
                pixels[4 * index + 3] = 255;
            }
        }
    }
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

    Rule rule;

    sf::Uint8 *pixels = new sf::Uint8[windowWidth * windowHeight * 4];
    float *ovalues = new float[gridWidth * gridHeight * 3];
    float *values = new float[gridWidth * gridHeight * 3];
    sf::Texture texture;
    texture.create(windowWidth, windowHeight);
    sf::Sprite sprite(texture);

    for (int i = 0; i < gridWidth * gridHeight * 3; i++) {
        values[i] = 0;
    }
    values[gridWidth / 2 + gridWidth * (gridHeight / 2)] = 1;
    values[gridWidth / 2 + gridWidth * (gridHeight / 2) + 1] = 1;
    values[gridWidth / 2 + gridWidth * (gridHeight / 2) + 2] = 1;

    for (int i = 0; i < gridWidth * gridHeight * 3; i++) {
        ovalues[i] = values[i];
    }

    writeValuesToPixels(values, pixels);

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

        for (int i = 0; i < gridWidth * gridHeight * 3; i++) {
            values[i] = randomNum2();
        }

        writeValuesToPixels(values, pixels);
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
