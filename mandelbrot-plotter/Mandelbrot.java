/*
 * BEN KERN
 * 
 * I wanted to try this so I did, draws a portion of the Mandelbrot set specified in the parameters given.
 *
 *
 */


package Mandelbrot;
import java.awt.BorderLayout;
import java.awt.Graphics;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;

public class Mandelbrot
{
    private static JFrame frame;
    
    private static BufferedImage bi;
    private final double zoomAmount = 10;
    public static int width, height;
    
    public static Mandelbrot m;
    private MandelbrotFrame currentFrame;
    
    ArrayList<MandelbrotFrame> frameList;

    public static void main(String... args) throws InterruptedException {
        m = new Mandelbrot(600,600, 0, 0, 2);
        while (true) {
            m.currentFrame.doCalc();
        }
    }


    //m = new Mandelbrot(720,720,-0.15920209459934798, 1.0225993850457615, 1e-13);


    /*
     * MAKE IT WORK AROUND THIS
     * 
     * -0.15920209459933324, 1.022599385045776, 1.7763568394002505E-15
     * 0.35099216726246363, 0.0940300970626181, 1e-14
     */

    Mandelbrot(int width, int height, double centerX, double centerY, double zoom) {
        
        Mandelbrot.width = width;
        Mandelbrot.height = height;
        
        bi = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        
        //set of frames that I will be able to iterate through LATER
        frameList = new ArrayList<MandelbrotFrame>();
        
        currentFrame = new MandelbrotFrame(centerX, centerY, zoom);
        frameList.add(currentFrame);

        //setup JFrame stufferoo
        frame = new JFrame("Mandelbrot Animator");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.getContentPane().add(BorderLayout.CENTER, new DrawPanel());
        frame.setResizable(false);
        frame.setSize(width, height+22);
        frame.setLocationByPlatform(true);
        frame.setVisible(true);

        //on click, it SHOULD just create new Mandelbrot but that's difficult because of the way that I did it
        frame.addMouseListener(new MouseAdapter() {
            public void mouseClicked(MouseEvent e) {
                
                currentFrame.stopped = true;

                //get new position
                double dx = (((double)(e.getX())/(double)width)*currentFrame.zoom*2+currentFrame.centerX-currentFrame.zoom);
                double dy = -(((double)(e.getY()-25)/(double)height)*currentFrame.zoom*2-currentFrame.centerY-currentFrame.zoom);

                System.out.println(dx+", "+dy+", "+currentFrame.zoom);

                //zoom in by 10 on left click, zoom out on right click
                boolean isRightClick = SwingUtilities.isRightMouseButton(e) || e.isControlDown();
                
                currentFrame = new MandelbrotFrame(dx, dy, currentFrame.zoom*Math.pow(zoomAmount, isRightClick?1:-1));
                frameList.add(currentFrame);
            }
        });
    }
    
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