import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseEvent;
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

public class Game extends JPanel implements MouseListener, KeyListener {

    private DrawCanvas canvas;

    protected static int width,height;
    protected Color BACKGROUND_COLOR = Color.WHITE;
    protected boolean paused = false;

    protected int UPDATE_RATE = 120;
    protected static final int MAXSTEP = 10000;
    protected static int maxStep = 1;

    public Game(int width, int height) {
        addMouseListener(this);
        addKeyListener(this);
        setFocusable(true);
        requestFocus();

        Game.width = width;
        Game.height = height;

        checkForResize();
    }

    protected void gameStart() {
        // Run the game logic in its own thread.
        Thread gameThread = new Thread() {
            public void run() {
                while (true) {
                    if (!paused) {
                        for (int s=0;s<maxStep;s++) {
                            gameUpdate();
                        }
                        repaint();
                    }
                    try {
                        Thread.sleep(1000 / UPDATE_RATE);
                    } catch (InterruptedException ex) {} catch (ConcurrentModificationException e) {}
                }
            }
        };
        gameThread.start();
    }

    class DrawCanvas extends JPanel {
        @Override
        public void paintComponent(Graphics g) {
            super.paintComponent(g);
            g.setColor(BACKGROUND_COLOR);
            g.fillRect(0, 0, width, height);
            draw(g);
        }
        @Override
        public Dimension getPreferredSize() {
            return new Dimension(width, height);
        }
    }

    private void checkForResize() {
        canvas = new DrawCanvas();
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
    

    //THE FOLLOWING ARE MORE JUST TO BE OVERWRITTEN

    protected void draw(Graphics g) {
    }

    protected void gameUpdate() {
    }

    @Override
    public void mouseClicked(MouseEvent e) {
    }

    @Override
    public void mousePressed(MouseEvent e) {
    }

    @Override
    public void mouseReleased(MouseEvent e) {

    }

    @Override
    public void mouseEntered(MouseEvent e) {

    }

    @Override
    public void mouseExited(MouseEvent e) {

    }

    @Override
    public void keyTyped(KeyEvent e) {
    }

    @Override
    public void keyPressed(KeyEvent e) {
    }

    @Override
    public void keyReleased(KeyEvent e) {
    }

    
    

    //THE FOLLOWING ARE JUST THINGS THAT ARE USEFUL

    public static double getDist(double x1,double x2,double y1,double y2) {
        return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    }

    public static String printArray(double[] array) {
        String print = "{"+Math.round(array[0]*100)/100.0;

        for (int a=1;a<array.length;a++) {
            print += ", "+Math.round(array[a]*100)/100.0;
        }

        print += "}";

        return print;
    }

    public static String printArray(int[] array) {
        String print = "{"+array[0];

        for (int a=1;a<array.length;a++) {
            print += ", "+array[a];
        }

        print += "}";

        return print;
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

    public static double rand() {
        return Math.random()*2-1;
    }

    public static double average(double[] inputs) {
        double sum = 0;
        for (int i=0;i<inputs.length;i++) {
            sum += inputs[i];
        }
        return sum/(double)inputs.length;
    }

    public static double[][] matMult(double[][] a, double[][] b) {
        if (a[0].length != b.length) {
            System.out.println("WWAH WAHH");
            return null;
        }
        double[][] prod = new double[a.length][b[0].length];
        for (int k=0;k<b[0].length;k++) {
            for (int j=0;j<a.length;j++) {
                for (int i=0;i<b.length;i++) {
                    prod[j][k] += a[j][i]*b[i][k];
                }
            }
        }
        return prod;
    }

    public static double[][] vect2Mat(double[] a) {
        double[][] mat = new double[a.length][1];
        for (int i=0;i<a.length;i++) {
            mat[i][0] = a[i];
        }
        return mat;
    }

    public static double[][] transpose(double[][] a) {
        double[][] mat = new double[a[0].length][a.length];
        for (int i=0;i<a.length;i++) {
            for (int j=0;j<a[0].length;j++) {
                mat[j][i] = a[i][j];
            }
        }
        return mat;
    }

    public static double[] mat2Vect(double[][] a) {
        double[] output;
        if (a.length == 1) {
            output = new double[a[0].length];
            for (int i=0;i<a[0].length;i++) {
                output[i] = a[0][i];
            }
            return output;
        } else if (a[0].length == 1) {
            output = new double[a.length];
            for (int i=0;i<a.length;i++) {
                output[i] = a[i][0];
            }
            return output;
        } else {
            return null;
        }
    }
    
    public static int sgn(double a) {
        return Math.abs(a) < 1e-12 ? 0 : (int) Math.round(a/Math.abs(a));
    }
}
