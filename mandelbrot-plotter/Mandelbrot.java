/*
 * BEN KERN
 * 
 * I wanted to try this so I did, draws a portion of the Mandelbrot set specified in the parameters given.
 *
 *
 */


package Mandelbrot;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.WindowEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.LinkedList;

import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;

public class Mandelbrot
{
    JFrame frame;
    DrawPanel drawPanel;

    int color, width, height;
    
    int THROWOUT = 10;

    double centerX, centerY, zoom;

    boolean stopped;

    final int STEP = 1;

    ArrayList<Pixel> values;
    BufferedImage bi;

    int t = 0;
    static Mandelbrot m;

    public static void main(String... args) {
        m = new Mandelbrot(720,720,-0.15920209459934798, 1.0225993850457615, 1e-13);
        m.go();
    }
    
    
    /*
     * 
     * 
     * MAKE IT WORK AROUND THIS
     * 
     * 
     * double centerX = -0.15920209459933324;
     * double centerY = 1.022599385045776;
     * double zoom = 1.7763568394002505E-15;
     * 
     * double centerX = 0.35099216726246363;
     * double centerY = 0.0940300970626181;
     * double zoom = 1e-14;
     */

    Mandelbrot(int width, int height, double centerX, double centerY, double zoom) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.zoom = zoom;

        color = 0xff0000;

        bi = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        this.width = width;
        this.height = height;
        values = new ArrayList<Pixel>();
        for (int x=0;x<width;x++) {
            for (int y=0;y<height;y++) {
                values.add(new Pixel(x,y));
            }
        }
    }
    
    /*
    
    static class MandelbrotSet {
        LinkedList Ben;
        MandelbrotSet(int width, int height, double centerX, double centerY, double startZoom, double endZoom, double zoomStep) {
            Ben = new LinkedList<Mandelbrot>();
        }
        
        void start() {
            
        }
    }*/

    private void go()
    {
        m.stopped = false;
        frame = new JFrame("Test");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        drawPanel = new DrawPanel();

        frame.getContentPane().add(BorderLayout.CENTER, drawPanel);
        frame.addMouseListener(new MouseListener() {

            @Override
            public void mouseClicked(MouseEvent e) {
                double dx = (((double)(e.getX())/(double)m.width)*m.zoom*2+m.centerX-m.zoom);
                double dy = -(((double)(e.getY()-25)/(double)m.height)*m.zoom*2-m.centerY-m.zoom);
                m.centerX = dx;
                m.centerY = dy;

                if (SwingUtilities.isRightMouseButton(e) || e.isControlDown()) {
                    m.zoom = zoom*10.0;
                } else {
                    m.zoom = zoom/10.0;
                }

                bi = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
                color = 0xff0000;
                t = 0;
                values = new ArrayList<Pixel>();
                for (int x=0;x<m.width;x++) {
                    for (int y=0;y<m.height;y++) {
                        values.add(new Pixel(x,y));
                    }
                }
                System.out.println("double centerX = "+dx+";\ndouble centerY = "+dy+";\ndouble zoom = "+zoom+";");

            }

            public void mousePressed(MouseEvent e) {}
            public void mouseReleased(MouseEvent e) {}
            public void mouseEntered(MouseEvent e) {}
            public void mouseExited(MouseEvent e) {}
        });

        frame.setResizable(false);
        frame.setSize(width, height);
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

    private void nextColor() {
        if (color == 0xff0000 || color == 0x000000 || color == 0x00ff00 || color == 0x0000ff || color == 0xffff00 || color == 0x00ffff || color == 0xff00ff || color == 0xffffff) {
            t = (t+1)%6;
        }
        switch (t) {
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

    private void animate()
    {
        while (!m.stopped)
        {
            for (int s=0;s<STEP;s++) {
                for (int i=0;i<values.size();i++) {
                    try {
                        if (values.get(i).value.modulo()>THROWOUT) {
                            bi.setRGB(values.get(i).boardX, values.get(i).boardY, values.get(i).pColor);
                        } else {
                            values.get(i).calc();
                        }
                    } catch (IndexOutOfBoundsException e) {
                        System.out.println(i);
                    }
                }
                nextColor();
            }

            try
            {
                Thread.sleep(1);
            }
            catch (Exception e)
            {
                e.printStackTrace();
            }
            frame.repaint();
        }
    }



    class Pixel {
        int boardX, boardY, pColor;
        ImaginaryNum startPos, value;

        Pixel(int boardX, int boardY) {
            this.boardX = boardX;
            this.boardY = boardY;
            pColor = color;

            startPos = new ImaginaryNum(((double)boardX/(double)width)*zoom*2+centerX-zoom, -(((double)boardY/(double)height)*zoom*2-centerY-zoom));
            value = new ImaginaryNum(startPos);
            if (boardX<0 || boardY<0 || boardX>=width || boardY>=height) {
                System.out.println(boardX+", "+boardY);
            }
        }

        Pixel(Pixel other) {
            this.boardX = other.boardX;
            this.boardY = other.boardY;

            startPos = new ImaginaryNum(other.startPos);
            value = new ImaginaryNum(startPos);
        }

        void calc() {
            value = (value.mult(value)).add(startPos);
            pColor = color;
        }
    }

    class ImaginaryNum {
        double r,i;

        ImaginaryNum(double r, double i) {
            this.r = r;
            this.i = i;
        }

        ImaginaryNum(ImaginaryNum p) {
            this.r = p.r;
            this.i = p.i;
        }

        ImaginaryNum neg() {
            return new ImaginaryNum(-r,-i);
        }

        ImaginaryNum comp() {
            return new ImaginaryNum(r,-i);
        }

        ImaginaryNum add(ImaginaryNum c) {
            return new ImaginaryNum(r+c.r,i+c.i);
        }

        ImaginaryNum mult(ImaginaryNum c) {
            return new ImaginaryNum(r*c.r-i*c.i,i*c.r+r*c.i);
        }
        
        ImaginaryNum pow(ImaginaryNum c) {
            double theta = c.r*angle()+c.i*Math.log(modulo());
            ImaginaryNum a = new ImaginaryNum(Math.cos(theta),Math.sin(theta)).mult(new ImaginaryNum(Math.exp(c.r*Math.log(modulo())-c.i*angle()),0));
            return a;
        }

        double modulo() {
            return Math.sqrt(mult(new ImaginaryNum(r,i).comp()).r);
        }
        
        double angle() {
            return Math.atan2(i,r);
        }
        
        void print() {
            System.out.println(r+" + "+i+"i");
        }
    }
}
