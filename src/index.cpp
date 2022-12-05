#include "Ball.hpp"
#include <SFML/Graphics.hpp>
#include <cmath>
#include <iostream>
#include <vector>

const float randomNum2() { return ((float)rand() / (float)RAND_MAX); }

float sigmoid(float x) { return 1 / (1 + std::exp(-x)); }

float crossSigmoid(float x) { return 1 - 4 * sigmoid(x) * (1 - sigmoid(x)); }

class Term {
  private:
    int dx;
    int dy;
    int dz;
    int dt;

  public:
    Term(int dx, int dy, int dz, int dt) : dx(dx), dy(dy), dz(dz), dt(dt) {}
    int getIndex(int index) {
        int x = (index / 3) % gridWidth;
        int y = (index / 3) / gridWidth;
        int z = index % 3;
        int t = 0; // unused for now

        int nx = (x + dx + gridWidth) % gridWidth;
        int ny = (y + dy + gridHeight) % gridHeight;
        int nz = (z + dz + 3) % 3;

        return nz + 3 * (nx + gridWidth * ny);
    }
};

class Rule {
  private:
    std::vector<Term> terms;
    float coefficient;

  public:
    Rule() { coefficient = randomNum2() * 2 - 1; }
    void newTerm(int dx, int dy, int dz) {
        terms.push_back(Term(dx, dy, dz, 0));
    }
    float doRule(float *values, int index) {
        float result = coefficient;
        for (Term &term : terms) {
            result *= values[term.getIndex(index)];
        }
        return result;
    }
    void update() {
        coefficient = std::min(
            1.f, std::max(-1.f, coefficient + 0.1f * (randomNum2() * 2 - 1)));
    }
};
class RuleSet {
  private:
    std::vector<Rule> rules;

  public:
    RuleSet() {
        Rule rule;
        rules.push_back(rule);
        for (int x = -1; x <= 1; x++) {
            for (int y = -1; y <= 1; y++) {
                for (int z = -1; z <= 1; z++) {
                    rule = Rule();
                    rule.newTerm(x, y, z);
                    rules.push_back(rule);
                }
            }
        }
    }
    float doRule(float *values, int index) {
        float result = 0;
        for (Rule &rule : rules) {
            result += rule.doRule(values, index);
        }
        return crossSigmoid(result);
    }
    void update() {
        for (Rule &rule : rules) {
            rule.update();
        }
    }
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

    RuleSet *rulesets = new RuleSet[3];

    sf::Uint8 *pixels = new sf::Uint8[windowWidth * windowHeight * 4];
    float *ovalues = new float[gridWidth * gridHeight * 3];
    float *values = new float[gridWidth * gridHeight * 3];
    sf::Texture texture;
    texture.create(windowWidth, windowHeight);
    sf::Sprite sprite(texture);

    for (int i = 0; i < gridWidth * gridHeight * 3; i++) {
        values[i] = 0;
    }
    int center = 3 * (gridWidth / 2 + gridWidth * (gridHeight / 2));
    values[center] = 1;
    values[center + 1] = 1;
    values[center + 2] = 1;

    for (int i = 0; i < gridWidth * gridHeight * 3; i++) {
        ovalues[i] = values[i];
    }

    writeValuesToPixels(values, pixels);

    sf::Clock clock;
    FpsHandler fpsHandler;

    int t = 0;

    float threshold = 0.1;

    while (window.isOpen()) {
        clock.restart();
        sf::Event event;

        while (window.pollEvent(event))
            if (event.type == sf::Event::Closed)
                window.close();

        window.clear();

        float *first = new float[3];

        for (int z = 0; z < 3; z++) {
            first[z] = values[z];
        }

        bool foundDiff = false;

        for (int i = 0; i < gridWidth * gridHeight; i++) {

            for (int z = 0; z < 3; z++) {
                values[3 * i + z] = rulesets[z].doRule(ovalues, 3 * i + z);
                if (std::abs(values[3 * i + z] - first[z]) > threshold) {
                    foundDiff = true;
                }
            }
        }

        if (!foundDiff) {
            int center = 3 * (gridWidth / 2 + gridWidth * (gridHeight / 2));
            values[center] = 1;
            values[center + 1] = 1;
            values[center + 2] = 1;
        }

        for (int i = 0; i < gridWidth * gridHeight * 3; i++) {
            ovalues[i] = values[i];
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

        for (int z = 0; z < 3; z++) {
            rulesets[z].update();
        }
    }
}
