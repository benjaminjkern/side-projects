/*
 * BEN KERN
 * 
 * I wanted to try this so I did, draws a portion of the Mandelbrot set specified in the parameters given.
 *
 *
 */


package mandelbrot;
import java.awt.BorderLayout;
import java.awt.Graphics;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;

public class Mandelbrot
{
    boolean aDown, dDown;

    public static JFrame frame;

    public static BufferedImage bi;

    private int frames;
    public int frameCount;

    boolean paused;
    boolean animating;

    private double zoomFactor;
    public static int width, height;

    public static Mandelbrot m;
    private MandelbrotFrame currentFrame;

    ArrayList<MandelbrotFrame> frameList;

    public static void main(String... args) throws InterruptedException {
        m = new Mandelbrot(500,500, -0.15920209459934798, 1.0225993850457615, 2, 1.7763568394002505E-15, 1000);
        m.go();
    }


    //m = new Mandelbrot(720,720,-0.15920209459934798, 1.0225993850457615, 1e-13);


    /*
     * MAKE IT WORK AROUND THIS
     * 
     * -0.15920209459933324, 1.022599385045776, 1.7763568394002505E-15
     * 0.35099216726246363, 0.0940300970626181, 1e-14
     */

    public void go() throws InterruptedException {
        while (!animating) {
            if (aDown || dDown) {
                if (aDown && frameCount > 0) frameCount--;
                if (dDown) {
                    if (frameCount < frameList.size()-1) frameCount++;
                    else paused = false;
                }

                currentFrame = frameList.get(frameCount);
                currentFrame.stopped = true;
                Thread.sleep(1000/30);
            } else {
                currentFrame.stopped = false;
            }
            
            drawFrame();

            currentFrame.doCalc();

            if (!paused && frameList.size()<frames) newMFrame(currentFrame.centerX, currentFrame.centerY, currentFrame.zoom*zoomFactor);
            else if (frameList.size()>=frames) System.out.println("done");
            
            System.out.println(frameCount);
        }
    }

    Mandelbrot(int width, int height, double centerX, double centerY, double startZoom, double endZoom, int frames) {

        Mandelbrot.width = width;
        Mandelbrot.height = height;

        //set of frames that I will be able to iterate through LATER
        frameList = new ArrayList<MandelbrotFrame>();
        bi = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);

        //setup JFrame stufferoo
        frame = new JFrame("Mandelbrot Animator");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.getContentPane().add(BorderLayout.CENTER, new DrawPanel());
        frame.setResizable(false);
        frame.setSize(width, height+22);
        frame.setLocationByPlatform(true);
        frame.setVisible(true);

        newMFrame(centerX, centerY, startZoom);

        paused = false;
        animating = false;

        this.frames = frames;
        zoomFactor = Math.pow(endZoom/startZoom, 1./(frames-1));

        //do stuff on click
        frame.addMouseListener(new MouseAdapter() {
            public void mouseClicked(MouseEvent e) {
                //get new position
                double dx = (((double)(e.getX())/(double)width)*currentFrame.zoom*2+currentFrame.centerX-currentFrame.zoom);
                double dy = -(((double)(e.getY()-25)/(double)height)*currentFrame.zoom*2-currentFrame.centerY-currentFrame.zoom);

                System.out.println(dx+", "+dy+", "+currentFrame.zoom);

                //zoom in by 10 on left click, zoom out on right click
                boolean isRightClick = SwingUtilities.isRightMouseButton(e) || e.isControlDown();

                currentFrame = new MandelbrotFrame(dx, dy, currentFrame.zoom*Math.pow(zoomFactor, isRightClick?1:-1));
                frameList.add(currentFrame);
                frameCount = frameList.size()-1;
            }
        });

        frame.addKeyListener(new KeyAdapter() {
            public void keyPressed(KeyEvent e) {
                currentFrame.stopped = true;
                paused = true;
                if (e.getKeyCode() == KeyEvent.VK_A) {
                    aDown = true;
                    dDown = false;
                } else if (e.getKeyCode() == KeyEvent.VK_D) {
                    dDown = true;
                    aDown = false;
                }
            }
            
            public void keyReleased(KeyEvent e) {
                if (e.getKeyCode() == KeyEvent.VK_A) {
                    aDown = false;
                } else if (e.getKeyCode() == KeyEvent.VK_D) {
                    dDown = false;
                }
            }
        });
    }

    public void newMFrame(double newCenterX, double newCenterY, double newZoom) {
        currentFrame = new MandelbrotFrame(newCenterX, newCenterY, newZoom);
        frameList.add(currentFrame);
        frameCount = frameList.size()-1;
    }

    //this really should only be used to go back to a frame
    public void drawFrame() {
        for (int y=0; y<height; y++) {
            for (int x=0; x<width; x++) {
                bi.setRGB(x, y, currentFrame.grid[y][x].pColor);
            }
        }
        frame.repaint();
    }

    // may or may not actually be necessary tbh
    class DrawPanel extends JPanel
    {
        private static final long serialVersionUID = 1L;

        public void paintComponent(Graphics g)
        {
            g.drawImage(bi, 0, 0, null);
        }
    }
}