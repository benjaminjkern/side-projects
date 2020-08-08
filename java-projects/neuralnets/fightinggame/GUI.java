package neuralnets.fightinggame;

/*
 * This is privately only for the AIFightingGame
 */

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;

import kern.Tools;
import neuralnets.Population;

public class GUI {
    public Component stage, lowerStage, textBox, colorBar, r1, r2;
    public TextField c1, c2, time, game, gen;

    public GUI(int width, int height) {

        stage = new Component(0, 0, width, height) {
            @Override
            void draw(Graphics g) {
                super.draw(g);
                g.setColor(Color.BLACK);
                g.drawLine(width / 2, 0, width / 2, height);
            }
        };

        lowerStage = new Component(0, stage.height - 85, width, 85, Color.PINK, Color.BLACK) {};

        textBox = new Component(stage.width / 2 - 150 / 2, stage.height - lowerStage.height / 2, 150, 20) {};

        colorBar = new Component(0, stage.height - 100, width, 15) {

            Population myPop;

            @Override
            void display(Population p) { myPop = p; }

            @Override
            void draw(Graphics g) {
                double widthPer = (double) width / (double) myPop.size;

                for (int p = 0; p < myPop.size; p++) {
                    g.setColor(myPop.get(p).color);
                    g.fillRect((int) (x + widthPer * p), y, (int) Math.ceil(widthPer), height);
                }

                g.setColor(Color.BLACK);
                g.drawLine(x, y, x + width, y);
            }

        };

        r1 = new Component(-50, -50, 20, 10, Color.RED, Color.BLACK) {};
        r2 = new Component(-50, -50, 20, 10, Color.GREEN, Color.BLACK) {};

        c1 = new TextField(stage.width / 4, lowerStage.height / 2);
        c2 = new TextField(stage.width * 3 / 4, lowerStage.height / 2);
        time = new TextField(stage.width / 2, stage.height - lowerStage.height / 2 + colorBar.height / 2);
        game = new TextField(3 * stage.width / 4, stage.height - lowerStage.height / 2 + colorBar.height / 2);
        gen = new TextField(stage.width / 4, stage.height - lowerStage.height / 2 + colorBar.height / 2);
    }

    public void draw(Graphics g) {
        stage.draw(g);
        lowerStage.draw(g);
        textBox.draw(g);
        colorBar.draw(g);

        c1.draw(g);
        c2.draw(g);
        time.draw(g);
        game.draw(g);
        gen.draw(g);

        r1.draw(g);
        r2.draw(g);
    }

    public void set(Component c, int x, int y, int w, int h) { c.set(x, y, w, h); }

    public void display(Population p) { colorBar.display(p); }

    public abstract class Component {
        int width, height, x, y;
        Color fColor, bColor;

        Component(int x, int y, int w, int h, Color fc, Color bc) {
            set(x, y, w, h);
            fColor = fc;
            bColor = bc;
        }

        Component(int x, int y, int w, int h) {
            set(x, y, w, h);
            fColor = Color.WHITE;
            bColor = Color.BLACK;
        }

        void display(Population p) {}

        void set(int x, int y, int w, int h) {
            this.x = x;
            this.y = y;
            width = w;
            height = h;
        }

        void draw(Graphics g) {
            g.setColor(fColor);
            g.fillRect(x, y, width, height);
            g.setColor(bColor);
            g.drawRect(x, y, width, height);
        }
    }

    class TextField {
        String[] text;
        int x;
        int y;

        TextField(int posX, int posY) {
            text = new String[] { "" };
            x = posX;
            y = posY;
        }

        void display(String... s) { text = s; }

        void display(int i) { text = new String[] { "" + i }; }

        void display(double d) { text = new String[] { "" + d }; }

        public void draw(Graphics g) {
            g.setColor(Color.BLACK);
            g.setFont(new Font("Courier New", Font.PLAIN, 12));
            Tools.drawCenteredString(text, x, y, g);
        }
    }
}
