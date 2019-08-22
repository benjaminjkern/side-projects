/*
 * BEN KERN
 * 
 * I wanted to try this so I did, draws a portion of the Mandelbrot set specified in the parameters given.
 *
 *
 */


package mandelbrot;
import java.awt.Color;
import java.awt.event.MouseEvent;
import java.io.FileNotFoundException;
import java.io.IOException;

import kern.Animator;

public class Mandelbrot extends Animator
{
    public static final int COLORS = 360;

    boolean paused;

    private double zoomFactor;

    public static void main(String... args) throws InterruptedException, FileNotFoundException, IOException {
        Mandelbrot m = new Mandelbrot(720, 720, 0.35099216726246363, 0.0940300970626181, 2, 1e-14, 1000);
        m.go();
    }


    //m = new Mandelbrot(720,720,-0.15920209459934798, 1.0225993850457615, 1e-13);


    /*
     * MAKE IT WORK AROUND THIS
     * 
     * -0.15920209459933324, 1.022599385045776, 1.7763568394002505E-15
     * 0.35099216726246363, 0.0940300970626181, 1e-14
     */

    
    

    Mandelbrot(int width, int height, double centerX, double centerY, double startZoom, double endZoom, int frames) {
    	super(width, height, 1, "Mandelbrot Animator", frames);

        zoomFactor = Math.pow(endZoom/startZoom, 1./(frames-1));
    	
    	keyframes[currentFrame] = new MandelbrotFrame(width, height, centerX, centerY, startZoom, zoomFactor, null);
    	
    	writeToGif = true;
    	
    	for (int i=0;i<Mandelbrot.COLORS;i++) colorMap.put(i, Color.HSBtoRGB(i/(float)Mandelbrot.COLORS, 1, 1));
    }

	@Override
    public void mouseClicked(MouseEvent e) {
        /*//get new position
        double dx = (((double)(e.getX())/(double)width)*currentFrame.zoom*2+currentFrame.centerX-currentFrame.zoom);
        double dy = -(((double)(e.getY()-25)/(double)height)*currentFrame.zoom*2-currentFrame.centerY-currentFrame.zoom);

        System.out.println(dx+", "+dy+", "+currentFrame.zoom);

        //zoom in by 10 on left click, zoom out on right click
        boolean isRightClick = SwingUtilities.isRightMouseButton(e) || e.isControlDown();

        currentFrame = new MandelbrotFrame(dx, dy, currentFrame.zoom*Math.pow(zoomFactor, isRightClick?1:-1));
        frameList.add(currentFrame);
        frameCount = frameList.size()-1;*/
    }

}