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

        int nx = (x + dx + gridWidth) % gridWidth;
        int ny = (y + dy + gridHeight) % gridHeight;
        int nz = (z + dz + 3) % 3;

        return nz + 3 * (nx + gridWidth * ny);
    }
    int getDt() { return dt; }
};

float range = 1;

class Rule {
  private:
    std::vector<Term> terms;
    float coefficient;

  public:
    Rule() { coefficient = (randomNum2() * 2 - 1) * range; }
    void newTerm(int dx, int dy, int dz, int dt) {
        terms.push_back(Term(dx, dy, dz, dt));
    }
    float doRule(float *values, float *ovalues, int index) {
        float result = coefficient;
        for (Term &term : terms) {
            result *= (term.getDt() ? values : ovalues)[term.getIndex(index)];
        }
        return result;
    }
    void update() {
        coefficient = std::min(
            range,
            std::max(-range, coefficient + 0.2f * (randomNum2() * 2 - 1)));
    }
    void fixCoefficient(float sum, float mean) { coefficient -= mean; }
    float getCoefficient() { return coefficient; }
    void setCoefficient(float coef) { coefficient = coef; }
};
class RuleSet {
  private:
    std::vector<Rule> rules;

  public:
    RuleSet() {

        float sum = 0;
        Rule rule;
        sum += rule.getCoefficient();
        rules.push_back(rule);
        // sum += rule.getCoefficient();
        // float b = rule.getCoefficient();

        // rule = Rule();
        // sum += rule.getCoefficient();
        // rule.newTerm(0, 0, 0, 0);
        // rules.push_back(rule);
        // for (int x = -1; x <= 1; x += 2) {
        //     rule = Rule();
        //     sum += rule.getCoefficient();
        //     rule.newTerm(x, 0, 0, 0);
        //     rules.push_back(rule);
        //     rule = Rule();
        //     sum += rule.getCoefficient();
        //     rule.newTerm(0, x, 0, 0);
        //     rules.push_back(rule);
        //     rule = Rule();
        //     sum += rule.getCoefficient();
        //     rule.newTerm(0, 0, x, 0);
        //     rules.push_back(rule);
        //     rule = Rule();
        //     sum += rule.getCoefficient();
        //     rule.newTerm(0, 0, 0, (x + 1) / 2);
        //     rules.push_back(rule);
        // }
        for (int x = -1; x <= 1; x += 1) {
            for (int y = -1; y <= 1; y += 1) {
                for (int z = -1; z <= 1; z += 1) {
                    for (int t = 0; t <= 1; t += 1) {
                        rule = Rule();
                        sum += rule.getCoefficient();
                        rule.newTerm(x, y, z, t);
                        rules.push_back(rule);
                    }
                }
            }
        }
        float mean = sum / ((float)rules.size());

        for (Rule &rule : rules) {
            rule.fixCoefficient(sum, mean);
        }
    }
    float doRule(float *values, float *ovalues, int index) {
        float result = 0;
        for (Rule &rule : rules) {
            result += rule.doRule(values, ovalues, index);
        }
        // return result;
        // return std::max(0.f, std::min(1.f, result));
        // return std::max(0.f, std::min(1.f, 0.5f * (result) + 0.5f));
        return sigmoid(result);
        // return crossSigmoid(2 * result);
    }
    void update() {
        float sum = 0, sumSquared = 0;
        for (Rule &rule : rules) {
            rule.update();
            sum += rule.getCoefficient();
        }

        float mean = sum / ((float)rules.size());

        for (Rule &rule : rules) {
            rule.fixCoefficient(sum, mean);
        }
    }
};

void writeValuesToPixels(float *values, sf::Uint8 *pixels) {
#pragma omp parallel for
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
    float *rvalues = new float[gridWidth * gridHeight * 3];
    sf::Texture texture;
    texture.create(windowWidth, windowHeight);
    sf::Sprite sprite(texture);

#pragma omp parallel for
    for (int i = 0; i < gridWidth * gridHeight * 3; i++) {
        // values[i] = randomNum2();
        values[i] = 0;
    }

#pragma omp parallel for
    for (int i = 0; i < gridWidth * gridHeight * 3; i++) {
        ovalues[i] = values[i];
        rvalues[i] = values[i];
    }

    writeValuesToPixels(values, pixels);

    sf::Clock clock;
    FpsHandler fpsHandler;

    int t = 0;

    float threshold = 0.1;

    while (window.isOpen()) {
        clock.restart();
        sf::Event event;

        while (window.pollEvent(event)) {
            if (event.type == sf::Event::Closed) {
                window.close();
                return 0;
            }
            if (event.type == sf::Event::MouseButtonPressed) {
                rulesets = new RuleSet[3];
            }
        }

        window.clear();

        float *first = new float[3];

        // float max = 0;
        // float sum = 0;

        bool foundDiff = false;

#pragma omp parallel for
        for (int i = 0; i < gridWidth * gridHeight * 3; i++) {
            rvalues[i] = values[i];
        }

#pragma omp parallel for
        for (int i = 0; i < gridWidth * gridHeight; i++) {
            for (int z = 0; z < 3; z++) {
                values[3 * i + z] =
                    rulesets[z].doRule(rvalues, ovalues, 3 * i + z);
                if (i == 0) {
                    first[z] = values[z];
                } else {
                    // max = std::max(max, std::abs(values[3 * i + z]));
                    // sum += values[3 * i + z];
                    if (std::abs(values[3 * i + z] - first[z]) > threshold) {
                        foundDiff = true;
                    }
                }
            }
        }

#pragma omp parallel for
        for (int i = 0; i < gridWidth * gridHeight * 3; i++) {
            ovalues[i] = rvalues[i];
        }

        if (!foundDiff) {
            // std::cout << "ADDING PEAK" << std::endl;
            int center = randomNum2() * (3 * gridWidth * gridHeight);
            values[center] = randomNum2();
        }

        // std::cout << max << "," << sum / (float)(3 * gridWidth * gridHeight)
        //           << std::endl;

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
