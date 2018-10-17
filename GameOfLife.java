package GAMEOFLIFE;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.WindowEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;

import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;

public class GameOfLife
{

    JFrame frame;
    DrawPanel drawPanel;

    int WIDTH, HEIGHT;

    int pixelSize = 8;

    boolean stopped;

    final int STEP = 1;

    BufferedImage bi;

    int t = 0;
    Pixel[][] board;

    GameOfLife(int width, int height, double centerX, double centerY, double zoom) {
        bi = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        WIDTH = width;
        HEIGHT = height;
        board = new Pixel[HEIGHT][WIDTH];
        for (int y = 0;y<HEIGHT/pixelSize;y++) {
            for (int x=0;x<WIDTH/pixelSize;x++) {
                board[y][x] = new Pixel(x,y,Math.random()<0.5);
            }
        }
    }

    static GameOfLife James;

    public static void main(String... args) {
        //James = new Test(720,720, -0.5365770128038193,0.6662122938368056,6.103515625E-5);
        James = new GameOfLife(600,600,0,0,2);
        James.go();
    }

    private void go()
    {
        James.stopped = true;
        frame = new JFrame("Test");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        drawPanel = new DrawPanel();

        frame.getContentPane().add(BorderLayout.CENTER, drawPanel);
        frame.addMouseListener(new MouseListener() {

            @Override
            public void mouseClicked(MouseEvent e) {
            }
            public void mousePressed(MouseEvent e) {
                board[(e.getY()-25)/pixelSize][e.getX()/pixelSize].alive = !board[(e.getY()-25)/pixelSize][e.getX()/pixelSize].alive;
            }
            public void mouseReleased(MouseEvent e) {}
            public void mouseEntered(MouseEvent e) {
                James.stopped = true;
            }
            public void mouseExited(MouseEvent e) {
                James.stopped = false;
            }
        });
        frame.setResizable(false);
        frame.setSize(WIDTH,HEIGHT);
        frame.setLocationByPlatform(true);
        frame.setVisible(true);
        animate();
    }

    class DrawPanel extends JPanel
    {
        public void paintComponent(Graphics g)
        {
            g.drawImage(bi, 0, 0, null);
        }
    }

    private void animate()
    {
        while (true)
        {
            if (!James.stopped) {
                try
                {
                    Thread.sleep(1);
                }
                catch (Exception e)
                {
                    e.printStackTrace();
                }

                for (int s=0;s<STEP;s++) {
                    for (int y = 0;y<HEIGHT/pixelSize;y += 1) {
                        for (int x=0;x<WIDTH/pixelSize;x += 1) {
                            board[y][x].checkSurroundings();
                        }
                    }
                    for (int y = 0;y<HEIGHT/pixelSize;y += 1) {
                        for (int x=0;x<WIDTH/pixelSize;x += 1) {
                            board[y][x].alive = board[y][x].next;
                        }
                    }
                }
            }

            for (int y = 0;y<HEIGHT/pixelSize;y += 1) {
                for (int x=0;x<WIDTH/pixelSize;x += 1) {
                    for (int px = 0;px<pixelSize;px += 1) {
                        for (int py = 0;py<pixelSize;py += 1) {
                            bi.setRGB(pixelSize*x+px,pixelSize*y+py,board[y][x].alive?0xffffff:0x000000);
                        }
                    }
                }
            }
            frame.repaint();
        }
    }

    class Pixel {
        int boardX, boardY;
        boolean alive;
        boolean next;

        Pixel(int boardX, int boardY, boolean alive) {
            this.boardX = boardX;
            this.boardY = boardY;
            this.alive = alive;
        }

        Pixel(Pixel other) {
            this.boardX = other.boardX;
            this.boardY = other.boardY;
        }

        void checkSurroundings() {
            int sum = 0;
            for (int bx=boardX-1;bx<=boardX+1;bx++) {
                for (int by=boardY-1;by<=boardY+1;by++) {
                    if (!(bx==boardX&&by==boardY || (bx<0 || bx>=WIDTH/pixelSize || by<0 || by>=HEIGHT/pixelSize))) sum += board[by][bx].alive?1:0;
                }
            }
            next = (sum==3 || (alive&&sum==2));
        }
    }
}