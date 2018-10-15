import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;

import javax.swing.JFrame;

public class GUI {
    public static int width, height;
    LowerStage l;

    public GUI(int width,int height) {
        GUI.width = width;
        GUI.height = height;
        l = new LowerStage();
    }

    public void draw(Graphics g) {
        g.setColor(Color.BLACK);
        g.drawLine(width/2, 0, width/2, height);
        l.draw(g);
    }

    public void set(int width, int height) {
        GUI.width = width;
        GUI.height = height;
    }

    public static void drawCenteredString(String[] s, int x, int y, Graphics g) {
        FontMetrics fm = g.getFontMetrics();
        double  lineHeight = (fm.getAscent()-fm.getDescent());
        for (int n=0;n<s.length;n++) {
            double newX = x-(fm.stringWidth(s[n])) / 2;
            double newY = y+lineHeight*(2*(1+n)-s.length);
            g.drawString(s[n], (int) newX, (int) newY);
        }
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
            g.setFont(new Font("Courier New", Font.PLAIN, 12));
            drawText(g);

            g.setColor(Color.BLACK);
            g.drawLine(0, height-HEIGHT, width, height-HEIGHT);
        }

        public void drawText(Graphics g) {
            drawCenteredString(new String[] {""+AIFightingGame.time}, width/2, height-HEIGHT/2+ColorBar.HEIGHT/2,g);

            drawCenteredString(new String[] {infoText(AIFightingGame.id1)}, width/4, HEIGHT/2+ColorBar.HEIGHT/2,g);
            drawCenteredString(new String[] {infoText(AIFightingGame.id2)}, 3*width/4, HEIGHT/2+ColorBar.HEIGHT/2,g);

            int matchNum = AIFightingGame.id1/2+1;
            int totalMatches = AIFightingGame.population.size/2;

            drawCenteredString(new String[] {"Generation: "+AIFightingGame.generation, "Match: "+matchNum+"/"+totalMatches}, 3*width/4, height-HEIGHT/2+ColorBar.HEIGHT/2,g);
            drawCenteredString(new String[] {"Oldest: "+AIFightingGame.oldest.name+", Age: "+AIFightingGame.oldest.age, "Highest Total Score: "+AIFightingGame.highestScore.name+", Total Score: "+AIFightingGame.highestScore.totalScore, "Highest Average Score: "+AIFightingGame.highestAverage.name+", Average Score: "+AIFightingGame.highestAverage.getAverageScore()}, width/4, height-HEIGHT/2+ColorBar.HEIGHT/2,g);
        }

        public String infoText(int id) {
            try {
                return "ID:"+AIFightingGame.population.get(id).name+"  Age:"+AIFightingGame.population.get(id).age+"  Average score:"+AIFightingGame.population.get(id).getAverageScore();
            } catch (NullPointerException e) {return "";} catch (ArrayIndexOutOfBoundsException e) {return "";}
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

        class ColorBar extends JFrame implements MouseListener {
            public static final int HEIGHT = 15;
            public static final int TEXTHEIGHT = 30;

            public ColorBar() {
                //yeuh
            }

            public void draw(Graphics g) {
                double WIDTH=  (double) width/ (double)AIFightingGame.population.size;
                for (int c=0;c<AIFightingGame.population.size;c++) {
                    g.setColor(AIFightingGame.population.get(c).color);
                    g.fillRect((int) (WIDTH*c), height-LowerStage.HEIGHT, (int) Math.ceil(WIDTH), HEIGHT);
                    /*g.setColor(Color.BLACK);
                    g.drawLine((int) width*c, Stage.height-LowerStage.HEIGHT, x2, y2);*/
                }
                g.setColor(Color.BLACK);
                //LowerStage.drawCenteredString("ID: "+theId,);


                g.drawLine(0, height-LowerStage.HEIGHT+HEIGHT, width, height-LowerStage.HEIGHT+HEIGHT);
            }

            @Override
            public void mouseClicked(MouseEvent e) {
                // TODO Auto-generated method stub

            }

            @Override
            public void mousePressed(MouseEvent e) {
                // TODO Auto-generated method stub

            }

            @Override
            public void mouseReleased(MouseEvent e) {
                // TODO Auto-generated method stub

            }

            @Override
            public void mouseEntered(MouseEvent e) {
                // TODO Auto-generated method stub

            }

            @Override
            public void mouseExited(MouseEvent e) {
                // TODO Auto-generated method stub

            }
        }
    }
}
