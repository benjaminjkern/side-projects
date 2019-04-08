//THIS SHOULD BE A CELLULAR AUTOMATA IN GENERAL



package cellularautomata;

import kern.Animator;
import kern.Tools;

import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.event.MouseMotionListener;
import java.util.Random;

public class CellularAutomata extends Animator implements MouseMotionListener
{

    boolean mouseDown;
    int mouseX, mouseY, oldMX, oldMY, oldMX2, oldMY2;

    public static int[] BSET = new int[] {2,3};
    public static int[] SSET = new int[] {3};
    //[-1, -1, -1, -1, 4, 5, -1, 7, 8]
    //        [0, -1, 2, 3, 4, 5, 6, 7, 8]
    public static int RANDCOLOR = new Random().nextInt(0xffffff);

    public static void main(String... args) throws InterruptedException {
        // Run UI in the Event Dispatcher Thread (EDT), instead of Main thread
        CellularAutomata c = new CellularAutomata(600,600,1);
        Tools.println(BSET);
        Tools.println(SSET);
        c.go();
    }

    CellularAutomata(int width, int height, int pixelSize) {
        super(width, height, pixelSize, "Cellular Automata", 1);
        frontierFrame = new CellularAutomataFrame(width, height, null);
        mouseDown = false;

        frame.addMouseMotionListener(this);
    }

    static int[] pickRand() {
        int[] output = new int[9];
        for (int i=0;i<9;i++) {
            output[i] = Math.random()>0.5 ? i : -1;
        }
        return output;
    }

    @Override
    public void mousePressed(MouseEvent e) {
        mouseDown = true;
        animating = false;
        mouseX = e.getX();
        mouseY = e.getY();
        oldMX = mouseX;
        oldMY = mouseY;
        oldMX2 = oldMX;
        oldMY2 = oldMY;
    }
    @Override
    public void mouseEntered(MouseEvent e) {
        running = false;
        animating = false;
    }

    @Override
    public void mouseExited(MouseEvent e) {
        running = true;
        animating = true;
        mouseDown = false;
    }

    @Override
    public void mouseClicked(MouseEvent e) {

    }

    @Override
    public void mouseReleased(MouseEvent e) {
        mouseDown = false;
    }

    @Override
    public void keyTyped(KeyEvent e) {

    }

    @Override
    public void keyPressed(KeyEvent e) {


    }

    @Override
    public void keyReleased(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_A) {
            frontierFrame = new CellularAutomataFrame(width, height, null);
            mouseDown = false;
            resetFrame = true;

            BSET = pickRand();
            SSET = pickRand();
            RANDCOLOR = new Random().nextInt(0xffffff);
            
            Tools.println(BSET);
            Tools.println(SSET);
        }
        if (e.getKeyCode() == KeyEvent.VK_SPACE) {
            frontierFrame = new CellularAutomataFrame(width, height, null);
            mouseDown = false;
            resetFrame = true;
        }

    }

    @Override
    public void changeFrame() {
        if (mouseDown) {
            int x1 = mouseX/pixelSize;
            int y1 = (mouseY-28)/pixelSize;
            int x2 = oldMX/pixelSize;
            int y2 = (oldMY-28)/pixelSize;
            for (int x = Math.min(x1, x2); x <= Math.max(x1,x2);x++) {
                for (int y = Math.min(y1, y2); y <= Math.max(y1,y2);y++) {
                    frontierFrame.set(x, y, 1);
                }
            }

            x1 = oldMX/pixelSize;
            y1 = (oldMY-28)/pixelSize;
            x2 = oldMX2/pixelSize;
            y2 = (oldMY2-28)/pixelSize;
            for (int x = Math.min(x1, x2); x <= Math.max(x1,x2);x++) {
                for (int y = Math.min(y1, y2); y <= Math.max(y1,y2);y++) {
                    frontierFrame.set(x, y, 1);
                }
            }
            drawFrame(frontierFrame);
        }
    }

    @Override
    public void mouseDragged(MouseEvent e) {
        if (mouseDown) {
            oldMX = oldMX2;
            oldMY = oldMY2;
            oldMX2 = mouseX;
            oldMY2 = mouseY;
            mouseX = e.getX();
            mouseY = e.getY();
        }
    }

    @Override
    public void mouseMoved(MouseEvent e) {
    }
}
