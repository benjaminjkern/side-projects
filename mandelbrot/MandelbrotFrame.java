package mandelbrot;

import java.util.ArrayList;

import kern.ComplexNum;
import kern.Keyframe;

public class MandelbrotFrame extends Keyframe {

    private double centerX, centerY, zoom, zoomFactor;

    private static final int THROWOUT = 2;
    protected int color;

    ArrayList<Pixel> pixelStack;

    MandelbrotFrame(int width, int height, double centerX, double centerY, double zoom, double zoomFactor, MandelbrotFrame parent) {
    	super(width, height, parent);
    	
        this.centerX = centerX;
        this.centerY = centerY;
        this.zoom = zoom;
        this.zoomFactor = zoomFactor;
        
    	pixelStack = new ArrayList<>();        	
    	for (int x=0;x<width;x++) {
    		for (int y=0;y<height;y++) {
    			pixelStack.add(new Pixel(x,y));
    		}
    	}
    	color = 0;
        
        doCalc();
    }

    private void doCalc()
    {
        int lastSize = width*height;
        int count = 0;
        
        while (lastSize == width*height || count < 10)
        {
            lastSize = pixelStack.size();
            
            for (int p=pixelStack.size()-1;p>=0;p--) {
                Pixel currentPixel = pixelStack.get(p);
                
                if (currentPixel.value.modulo()>THROWOUT) {
                    pixelStack.remove(p);
                    grid[currentPixel.boardY][currentPixel.boardX] = color;
                } else currentPixel.calc();
            }
            
        	color = (color + 1)%Mandelbrot.COLORS;
        	if (lastSize > pixelStack.size()) count = 0;
        	else count++;
        }
        
        pixelStack = null;
    }

    // position and values are stored in the pixels
    class Pixel {
        int boardX, boardY;
        ComplexNum startPos, value;

        Pixel(int boardX, int boardY) {
            this.boardX = boardX;
            this.boardY = boardY;

            startPos = new ComplexNum(((double)boardX/(double)width)*zoom*2+centerX-zoom, -(((double)boardY/(double)height)*zoom*2-centerY-zoom));
            value = new ComplexNum(startPos);
        }

        void calc() {
            value = value.mult(value).add(startPos);
        }
    }

	public MandelbrotFrame nextFrame() {
		if (next == null) next = new MandelbrotFrame(width, height, centerX, centerY, zoom*zoomFactor, zoomFactor, this);
		return (MandelbrotFrame) next;
	}

}
