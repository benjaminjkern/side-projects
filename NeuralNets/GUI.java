package neuralnets;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import kern.Tools;

public class GUI {
    static int width,height;

    LowerStage l;
    TextField time, c1, c2, gen, game;

    public GUI(int width, int height) {
        GUI.width = width;
        GUI.height = height;
        
        l = new LowerStage();
        
        time = new TextField(width/2, height - LowerStage.HEIGHT/2 + LowerStage.ColorBar.HEIGHT/2);
        c1 = new TextField(width / 4, LowerStage.HEIGHT / 2);
        c2 = new TextField(3 * width / 4, LowerStage.HEIGHT / 2);
        game = new TextField(3 * width / 4, height - LowerStage.HEIGHT / 2 + LowerStage.ColorBar.HEIGHT/2);
        gen = new TextField(width / 4, height - LowerStage.HEIGHT / 2 + LowerStage.ColorBar.HEIGHT / 2);
    }

    public void draw(Graphics g) {
        g.setColor(Color.BLACK);
        g.drawLine(width/2, 0, width/2, height);
        
        
        l.draw(g);
        time.draw(g);
        c1.draw(g);
        c2.draw(g);
        game.draw(g);
        gen.draw(g);
    }

    public static void set(int width, int height) {
        GUI.width = width;
        GUI.height = height;
    }

    class LowerStage {
        public static final int HEIGHT = 100;
        
        TextBox t;
        ColorBar b;

        public LowerStage() {
            t = new TextBox();
            b = new ColorBar();
        }

        public void draw(Graphics g) {
            g.setColor(Color.PINK);
            g.fillRect(0, height-HEIGHT, width, height);
            t.draw(g);
            b.draw(g);

            g.setColor(Color.BLACK);
            g.drawLine(0, height-HEIGHT, width, height-HEIGHT);
        }

        class TextBox {
            public static final int HEIGHT = 20;
            public static final int WIDTH = 150;

            public TextBox() {
                //yeuh
            }

            public void draw(Graphics g) {
                g.setColor(Color.WHITE);
                g.fillRect(width/2-WIDTH/2, height-LowerStage.HEIGHT/2+ColorBar.HEIGHT/2-HEIGHT/2, WIDTH, HEIGHT);
                g.setColor(Color.BLACK);
                g.drawRect(width/2-WIDTH/2, height-LowerStage.HEIGHT/2+ColorBar.HEIGHT/2-HEIGHT/2, WIDTH, HEIGHT);
            }
        }

        class ColorBar {
            public static final int HEIGHT = 15;
            public static final int TEXTHEIGHT = 30;

            Population myPop;

            public ColorBar() {
                //yeuh
            }
            
            public void display(Population p) {
                myPop = p;
            }

            public void draw(Graphics g) {
                double widthPer = (double) width / (double) myPop.size();

                for (int p = 0 ; p < myPop.size(); p++) {
                    g.setColor(myPop.get(p).color);
                    g.fillRect((int) (widthPer*p), height-LowerStage.HEIGHT, (int) Math.ceil(widthPer), HEIGHT);
                }

                g.setColor(Color.BLACK);
                g.drawLine(0, height-LowerStage.HEIGHT+HEIGHT, width, height-LowerStage.HEIGHT+HEIGHT);
            }
        }
    }
    
    class TextField {
        String[] text;
        int x;
        int y;
        
        TextField(int posX, int posY) {
            text = new String[] {""};
            x = posX;
            y = posY;
        }
        
        void display(String... s) {
            text = s;
        }
        
        void display(int i) {
            text = new String[] {""+i};
        }
        
        void display(double d) {
            text = new String[] {""+d};
        }
        
        public void draw(Graphics g) {
            g.setColor(Color.BLACK);
            g.setFont(new Font("Courier New", Font.PLAIN, 12));
            Tools.drawCenteredString(text, x, y, g);
        }
    }
}
