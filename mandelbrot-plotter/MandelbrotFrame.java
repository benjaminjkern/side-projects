package Mandelbrot;

import java.util.ArrayList;

public class MandelbrotFrame {
    private int width, height;
    boolean stopped;

    public double centerX, centerY, zoom;

    private int color;
    private int colorModulo = 0;

    private static final int THROWOUT = 2;

    ArrayList<Pixel> pixelStack;

    Pixel[][] grid;

    MandelbrotFrame(double centerX, double centerY, double zoom) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.zoom = zoom;
        this.width = Mandelbrot.width;
        this.height = Mandelbrot.height;

        stopped = false;

        color = 0xff0000;

        pixelStack = new ArrayList<Pixel>();
        grid = new Pixel[height][];
        for (int y=0;y<height;y++) {
            grid[y] = new Pixel[width];
            for (int x=0;x<width;x++) {
                Pixel newPixel = new Pixel(x,y);
                grid[y][x] = newPixel;
                pixelStack.add(newPixel);
            }
        }
    }

    public void doCalc() throws InterruptedException
    {
        int lastSize = width*height;
        while (!stopped && (lastSize == width*height || lastSize > pixelStack.size()))
        {
            lastSize = pixelStack.size();
            for (int p=0;p<pixelStack.size();p++) {
                Pixel currentPixel = pixelStack.get(p);
                if (currentPixel.value.modulo()>THROWOUT) {
                    currentPixel.pColor = color;
                    Mandelbrot.bi.setRGB(currentPixel.boardX, currentPixel.boardY, color);
                    pixelStack.remove(p);
                    p--;
                } else {
                    currentPixel.calc();
                }
            }
            
            nextColor();

            Thread.sleep(1);

            Mandelbrot.frame.repaint();
        }
    }

    // current color is stored globally and changes every iteration
    private void nextColor() {
        if (color == 0xff0000 || color == 0x000000 || color == 0x00ff00 || color == 0x0000ff || color == 0xffff00 || color == 0x00ffff || color == 0xff00ff || color == 0xffffff) {
            colorModulo = (colorModulo+1)%6;
        }
        switch (colorModulo) {
            case 0:
                color -= 0x000011;
                break;
            case 1:
                color += 0x001100;
                break;
            case 2:
                color -= 0x110000;
                break;
            case 3:
                color += 0x000011;
                break;
            case 4:
                color -= 0x001100;
                break;
            case 5:
                color += 0x110000;
                break;
        }
    }

    // position and values are stored in the pixels
    class Pixel {
        int boardX, boardY, pColor;
        ComplexNum startPos, value;

        Pixel(int boardX, int boardY) {
            this.boardX = boardX;
            this.boardY = boardY;
            pColor = 0;

            startPos = new ComplexNum(((double)boardX/(double)width)*zoom*2+centerX-zoom, -(((double)boardY/(double)height)*zoom*2-centerY-zoom));
            value = new ComplexNum(startPos);
        }

        void calc() {
            value = value.mult(value).add(startPos);
        }
    }

}
