#include <SFML/Graphics.hpp>
#include <vector>

int main() {
    sf::RenderWindow window(sf::VideoMode(640, 480), "SFML Application");

    sf::CircleShape shape;

    std::vector<int> position(100, 100);

    shape.setRadius(40);
    shape.setPosition(position[0], position[1]);
    shape.setFillColor(sf::Color::Cyan);

    while (window.isOpen()) {
        sf::Event event;

        while (window.pollEvent(event))
            if (event.type == sf::Event::Closed)
                window.close();

        position[0] += 1;
        shape.setPosition(position[0], position[1]);

        window.clear();
        window.draw(shape);
        window.display();
    }
}
