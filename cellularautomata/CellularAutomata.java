//THIS SHOULD BE A CELLULAR AUTOMATA IN GENERAL



package cellularautomata;

import kern.Tools;
import kern.Animator;
import java.awt.BorderLayout;
import java.awt.Graphics;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import javax.swing.JFrame;
import javax.swing.JPanel;

public class CellularAutomata extends Animator
{

    int pixelSize;

    static final int STEP = 1; // for animating multiple at a time!
    static final int[] COLOR_MAP = {0, 0xFFFFFF}; // the colors will be accessed as COLOR_MAP[(Pixel).color]
    static final int BORDER = 0;

    int t = 0;

    public static void main(String... args) {
        // Run UI in the Event Dispatcher Thread (EDT), instead of Main thread
        CellularAutomata c = new CellularAutomata(500, 500, 1);
        c.go();
    }

    CellularAutomata(int width, int height, int pixelSize) {
        super(width*pixelSize, height*pixelSize, "Cellular Automata");

        this.pixelSize = pixelSize;
    }

    @Override
    public void mousePressed(MouseEvent e) {
    }
    @Override
    public void mouseEntered(MouseEvent e) {
        stopped = true;
    }
    @Override
    public void mouseExited(MouseEvent e) {
        stopped = false;
        mouseDown = false;
    }
}
