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

    public static String print(int[] array) {
        String print = "["+array[0];

        for (int a=1;a<array.length;a++) {
            print += ", "+array[a];
        }

        print += "]";

        return print;
    }

    public static String print(double[] array) {
        String print = "["+Math.round(array[0]*100)/100.0;

        for (int a=1;a<array.length;a++) {
            print += ", "+Math.round(array[a]*100)/100.0;
        }

        print += "]";

        return print;
    }

    public static String print(double[][] array) {
        String print = "["+print(array[0]);

        for (int a=1;a<array.length;a++) {
            print += ",\n  "+print(array[a]);
        }

        print += "]\n(" + array.length + ", "+array[0].length+")";

        return print;
    }

    //THIS IS IMMENSELY USEFUL CUZ THE DEFAULT JAVA LIBRARY SUCKS
    public static void drawCenteredString(String[] s, int x, int y, Graphics g) {
        FontMetrics fm = g.getFontMetrics();
        double  lineHeight = (fm.getAscent()-fm.getDescent());
        for (int n=0;n<s.length;n++) {
            double newX = x-(fm.stringWidth(s[n])) / 2;
            double newY = y+lineHeight*(2*(1+n)-s.length);
            g.drawString(s[n], (int) newX, (int) newY);
        }
    }

    //return sign of a number (overloaded for vectors and matrices)
    //this can probably be reduced using lambda calculus or something hahaha
    public static int sgn(double a) {
        return Math.abs(a) < 1e-12 ? 0 : (int) Math.round(a/Math.abs(a));
    }

    public static int[] sgn(double[] a) {
        int[] output = new int[a.length];
        for (int i=0;i<a.length;i++) {
            output[i] = sgn(a[i]);
        }
        return output;
    }

    public static int[][] sgn(double[][] a) {
        int[][] output = new int[a.length][a[0].length];
        for (int y=0;y<a.length;y++) {
            output[y] = sgn(a[y]);
        }
        return output;
    }


    //sigmoid function
    public static double sigmoid(double a) {
        return 1./(1+Math.exp(-a));
    }

    public static double[] sigmoid(double[] a) {
        double[] output = new double[a.length];
        for (int i=0;i<a.length;i++) {
            output[i] = sigmoid(a[i]);
        }
        return output;
    }

    public static double[][] sigmoid(double[][] a) {
        double[][] output = new double[a.length][a[0].length];
        for (int y=0;y<a.length;y++) {
            output[y] = sigmoid(a[y]);
        }
        return output;
    }

    //ReLU function (overloaded, I wanna fix this by this point lol)
    public static double ReLU(double a) {
        return a<0 ? 0 : a;
    }

    public static double[] ReLU(double[] a) {
        double[] output = new double[a.length];
        for (int i=0;i<a.length;i++) {
            output[i] = ReLU(a[i]);
        }
        return output;
    }

    public static double[][] ReLU(double[][] a) {
        double[][] output = new double[a.length][a[0].length];
        for (int y=0;y<a.length;y++) {
            output[y] = ReLU(a[y]);
        }
        return output;
    }


    //creats a random number between two nums, overloaded for vectors and matrices
    public static double rand(double low, double high) {
        return Math.random()*(high-low) + low;
    }

    public static double[] rand(double low, double high, int lengthOfVector) {
        double[] output = new double[lengthOfVector];
        for (int i=0;i<lengthOfVector;i++) {
            output[i] = rand(low, high);
        }
        return output;
    }

    public static double[][] rand(double low, double high, int height, int width) {
        double[][] output = new double[height][width];
        for (int y=0;y<height;y++) {
            output[y] = rand(low, high, width);
        }
        return output;
    }



    //zeros (I'm stealing from Matlab at this point hahaha its okay though I like matlab better but hey if I have something cool like this then maybe I'll like using Java better
    public static double[] zeros(int length) {
        double[] output = new double[length];
        for (int i=0;i<length;i++) {
            output[i] = 0;
        }
        return output;
    }
    public static double[][] zeros(int height, int width) {
        double[][] output = new double[height][width];
        for (int y=0;y<height;y++) {
            output[y] = zeros(width);
        }
        return output;
    }



    //average of a vector, overloaded for matrices
    public static double sum(double[] a) {
        double sum = 0;
        for (int i=0;i<a.length;i++) {
            sum += a[i];
        }
        return sum;
    }

    public static double sum(double[][] a) {
        double output = 0;
        for (int y=0;y<a.length;y++) {
            output += sum(a[y]);
        }
        return output;
    }

    public static double[] sum(double[][] a, int dim) {
        if (dim==0) {
            double[] output = new double[a.length];
            for (int y=0;y<a.length;y++) {
                output[y] = sum(a[y]);
            }
            return output;
        } else if (dim==1) {
            return sum(transpose(a), 0);
        } else return null;
    }

    //average!
    public static double average(double[] a) {
        return sum(a)/(double)a.length;
    }

    public static double average(double[][] a) {
        return sum(a)/(double)(a.length*a[0].length);
    }

    public static double[] average(double[][] a, int dim) {
        return mult(sum(a, dim), 1 / (double) (dim == 0 ? a[0].length : a.length));
    }

    //make a copy of things!

    public static double[] makeCopy(double[] a) {
        double[] output = new double[a.length];
        for (int y=0;y<a.length;y++) {
            output[y] = a[y];
        }
        return output;
    }

    public static double[][] makeCopy(double[][] a) {
        double[][] output = new double[a.length][a[0].length];
        for (int y=0;y<a.length;y++) {
            output[y] = makeCopy(a[y]);
        }
        return output;
    }




    //LINEAR ALGEBRA

    //cast stuff as matrix (shown as public but ideally would only be used privately)
    public static double[][] matrix(double[] a) {
        double[][] mat = new double[a.length][1];
        for (int i=0;i<a.length;i++) {
            mat[i][0] = a[i];
        }
        return mat;
    }

    public static double[][] matrix(double a) {
        double[][] mat = new double[1][1];
        mat[0][0] = a;
        return mat;
    }

    //cast down to a vector or single number
    public static double[] cast2vect(double[][] a) {
        double[] output;
        if (a.length == 1) {
            output = new double[a[0].length];
            for (int i = 0;i<a[0].length;i++) {
                output[i] = a[0][i];
            }
        } else if (a[0].length == 1) {
            return cast2vect(transpose(a));
        }
        return null;
    }

    public static double cast2num(double[][] a) {
        if (a.length == 1 && a[0].length == 1) return a[0][0];
        throw new Error();
    }

    //I'm kinda inconsistent here as to whether my statements return null or an Error upon error, also whether this error management is done at the beginning or the end, I should fix that at some point 
    public static double add(double a, double b) {
        //lol
        return a+b;
    }

    public static double[] add(double[] a, double[] b) {
        if (a.length == b.length) {
            double[] output = new double[a.length];
            for (int i=0;i<a.length;i++) {
                output[i] = a[i]+b[i];
            }
            return output;
        } else return null;
    }

    public static double[][] add(double[][] a, double[][] b) {
        if (a.length == b.length && a[0].length == b[0].length) {
            double[][] output = new double[a.length][a[0].length];
            for (int y=0;y<a.length;y++) {
                output[y] = add(a[y], b[y]);
            }
            return output;
        } else return null;
    }

    // matrix multiplication! helpful for stuff! looks at all possible cases, starting with scalar times vector (commutative)
    public static double mult(double a, double b) {
        //this is redundant but hey I felt like putting it in just so there are less possible errors
        return a*b;
    }

    public static double[] mult(double[] a, double b) {
        double[] output = new double[a.length];
        for (int i=0;i<a.length;i++) {
            output[i] = a[i]*b;
        }
        return output;
    }

    public static double[] mult(double a, double[] b) {
        return mult(b,a);
    }

    //vector x vector depends on how you want to do it!
    public static void mult(double[] a, double[] b) {
        throw new Error("Need to specify what type of vector product wanted");
    }

    public static double dotProduct(double[] a, double[] b) {
        if (a.length != b.length) throw new Error("Improper dimension sizes");
        double output = 0;
        for (int i=0;i<a.length;i++) {
            output += a[i]*b[i];
        }
        return output;
    }

    public static double[] wedgeProduct(double[] a, double[] b) {
        //not implemented, I'll do this later I guess haha, I'm doing this for crossProduct for the other stuff I'll use when I get back to it that wasnt a sentence haha
        return null;
    }

    public static double innerProduct(double[] a, double[] b) {
        return dotProduct(a,b);
    }

    public static double[][] outerProduct(double[] a, double[] b) {
        double[][] output = new double[a.length][b.length];
        for (int y=0;y<a.length;y++) {
            for (int x=0;x<b.length;x++) {
                output[y][x] = a[y]*b[x];
            }
        }
        return output;
    }

    //next is scalar x matrix, easy to do just needs to be overloaded because of commutativity
    public static double[][] mult(double[][] a, double b) {
        double[][] output = new double[a.length][a[0].length];
        for (int y=0;y<a.length;y++) {
            output[y] = mult(a[y], b);
        }
        return output;
    }

    public static double[][] mult(double a, double[][] b) {
        return mult(b, a);
    }

    public static double[] mult(double[] a, double[][] b) {
        if (a.length != b.length) return null;
        double[] output = new double[b[0].length];
        for (int i=0;i<b[0].length;i++) {
            output[i] = dotProduct(a, transpose(b)[i]);
        }
        return null;
    }

    public static double[] mult(double[][] a, double[] b) {
        if (a[0].length != b.length) return null;
        double[] output = new double[a.length];
        for (int i=0;i<a.length;i++) {
            output[i] = dotProduct(a[i], b);
        }
        return output;
    }

    public static double[][] mult(double[][] a, double[][] b) {
        //defaults to outerproduct multiplication (slightly faster if using parallellized computation)

        return mult(a,b,false);
    }

    public static double[][] mult(double[][] a, double[][] b, boolean innerOuter) {
        if (a[0].length != b.length) return null;

        double[][] output = Game.zeros(a[0].length, b.length);

        if (innerOuter) {
            for (int y=0; y<a.length;y++) {
                output[y] = mult(a[y], b);
            }
        } else {
            for (int i=0; i<b.length;i++) {
                output = add(output, outerProduct(transpose(a)[i], b[i]));
            }
        }
        return output;
    }




    //this isnt idealized because of Java
    public static double[][] slice(double[][] a, int y1, int y2, int x1, int x2) {
        if (y1 == -1) y1 = 0;
        if (y2 == -1) y2 = a.length;
        if (x1 == -1) x1 = 0;
        if (x2 == -1) x2 = a[0].length;

        double[][] output = new double[y2-y1][x2-x1];
        for (int y = y1; y<y2; y++) {
            for (int x = x1; x<x2; x++) {
                output[y-y1][x-x1] = a[y][x];
            }
        }
        return output;
    }

    //this is overloaded so that I can cast whatever I want into it

    public static double[][] transpose(double[] a) {
        return transpose(matrix(a));
    }

    //by default, vectors are read as column vectors
    public static double[][] transpose(double[][] a) {
        double[][] mat = new double[a[0].length][a.length];
        for (int i=0;i<a.length;i++) {
            for (int j=0;j<a[0].length;j++) {
                mat[j][i] = a[i][j];
            }
        }
        return mat;
    }
}
