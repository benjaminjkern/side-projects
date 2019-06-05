package kern;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseListener;
import java.util.ConcurrentModificationException;
import javax.swing.JPanel;

/* Game Class by Ben Kern
 * 
 * I find that I have to reuse a lot of the same stuff for simulations
 * and games that I make so I figured I'll just make it easier on myself
 * and make something like this that I can reuse.
 * 
 * Implemented:
 * - Keyboard input
 * - Mouse input
 * - Ability to create any size canvas easily
 * - A speed up ability (For simulations)
 * - A bunch of helpful math operations that don't come with java by default
 * - A couple graphics operations that don't come with java by default
 * 
 * 
 * The goal is that I never need to change this class, I can use it as if it is a library
 * 
 */

public abstract class Game extends JPanel implements MouseListener, KeyListener {

    private static final long serialVersionUID = 1L;
    
    protected int width, height;
    
    protected static Color BACKGROUNDCOLOR = Color.WHITE;
    protected boolean paused = false;

    protected static final int UPDATERATE = 120;
    protected static final int MAXSTEP = 10000;
    protected int step = 1;

    public Game(int width, int height) {
        super();
        
        this.width = width;
        this.height = height;
        
        addMouseListener(this);
        addKeyListener(this);
        setFocusable(true);
        requestFocus();
        
        checkForResize();
    }

    protected void gameStart() {
        // Run the game logic in its own thread.
        Thread gameThread = new Thread() {
            @Override
            public void run() {
                while (true) {
                    if (!paused) {
                        for (int s=0;s<step;s++) {
                            gameUpdate();
                        }
                        repaint();
                    }
                    try {
                        Thread.sleep(1000 / UPDATERATE);
                    } catch (InterruptedException|ConcurrentModificationException ex) {Thread.currentThread().interrupt();}
                }
            }
        };
        gameThread.start();
    }

    class DrawCanvas extends JPanel {
        private static final long serialVersionUID = 1L;

        @Override
        public void paintComponent(Graphics g) {
            super.paintComponent(g);
            g.setColor(BACKGROUNDCOLOR);
            g.fillRect(0, 0, width, height);
            draw(g);
        }
        @Override
        public Dimension getPreferredSize() {
            return new Dimension(width, height);
        }
    }

    private void checkForResize() {
        DrawCanvas canvas = new DrawCanvas();

        this.setLayout(new BorderLayout());
        this.add(canvas, BorderLayout.CENTER);

        //IN CASE THE FRAME CHANGES SIZE
        this.addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                Component c = (Component)e.getSource();
                Dimension dim = c.getSize();
                width = dim.width;
                height = dim.height;
            }
        });
    }


    protected abstract void draw(Graphics g);

    protected abstract void gameUpdate();
}
