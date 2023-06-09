//THIS SHOULD BE A CELLULAR AUTOMATA IN GENERAL
package cellularautomata;

import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.event.MouseMotionListener;
import java.io.IOException;
import java.util.AbstractMap.SimpleEntry;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Random;
import java.awt.Color;

import kern.Animator;

public class CellularAutomata extends Animator implements MouseMotionListener {
    boolean mouseDown;
    int mouseX, mouseY, oldMX, oldMY;
    int colorChange;

    public static final int COLORS = 2;

    private Map<Entry<Integer, Integer>, Integer> ruleSet;
    private List<Integer> numList;
    // [-1, -1, -1, -1, 4, 5, -1, 7, 8]
    // [0, -1, 2, 3, 4, 5, 6, 7, 8]

    public static void main(String... args) throws InterruptedException, IOException {
        // Run UI in the Event Dispatcher Thread (EDT), instead of Main thread
        CellularAutomata c = new CellularAutomata(300, 300, 2);
        c.go();
    }

    CellularAutomata(int width, int height, int pixelSize) {
        super(width, height, pixelSize, "Cellular Automata", 1);

        loop = true;

        numList = genNumList(9);

        ruleSet = new HashMap<>();
        newRulesAndColors();
        reset();

        frame.addMouseMotionListener(this);
    }

    private void newRulesAndColors() {
        float colorBase = (float) Math.random();
        for (int c = 0; c < COLORS; c++) {
            for (int n : numList) {
                ruleSet.put(new SimpleEntry<>(c, n), new Random().nextInt(COLORS));
            }
            colorMap.put(c, Color.getHSBColor(colorBase, 1, 1).getRGB()); // generate
            // randomColors
        }
    }

    private void reset() {
        currentFrame = 0;
        keyframes[currentFrame] = new CellularAutomataFrame(width, height, null, ruleSet);
        mouseDown = false;
    }

    public List<Integer> genNumList(int base) {
        List<Integer> output = new ArrayList<>();
        int n = base - 1;
        output.add(n);
        int m;
        while (n < Math.pow(base, COLORS - 1) * (base - 1)) {
            m = 0;
            while (n % Math.pow(base, m + 1) == 0) {
                m++;
            }
            int a = (int) Math.ceil(n / Math.pow(base, m + 1)) % base;
            n += a * Math.pow(base, m) + base - a - 1;
            output.add(n);
        }
        return output;
    }

    @Override
    public void mousePressed(MouseEvent e) {
        mouseDown = true;
        mouseX = e.getX();
        mouseY = e.getY();
        oldMX = mouseX;
        oldMY = mouseY;
        colorChange = (keyframes[currentFrame].get(mouseX / pixelSize, (mouseY - 28) / pixelSize) + 1) % COLORS;// new
                                                                                                                // Random().nextInt(COLORS);
        keyframes[currentFrame].set(mouseX / pixelSize, (mouseY - 28) / pixelSize, colorChange);
    }

    @Override
    public void mouseEntered(MouseEvent e) {
        running = false;
    }

    @Override
    public void mouseExited(MouseEvent e) {
        running = true;
        mouseDown = false;
    }

    @Override
    public void mouseReleased(MouseEvent e) {
        mouseDown = false;
    }

    @Override
    public void keyReleased(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_A) {
            newRulesAndColors();
            reset();
        }
        if (e.getKeyCode() == KeyEvent.VK_SPACE)
            reset();
    }

    @Override
    public void mouseDragged(MouseEvent e) {
        if (mouseDown) {
            oldMX = mouseX;
            oldMY = mouseY;
            mouseX = e.getX();
            mouseY = e.getY();

            int x1 = mouseX / pixelSize;
            int y1 = (mouseY - 28) / pixelSize;
            int x2 = oldMX / pixelSize;
            int y2 = (oldMY - 28) / pixelSize;
            for (int t = 0; t <= 100; t++) {
                int x = (int) (x1 + t * (x2 - x1) / 100.);
                int y = (int) (y1 + t * (y2 - y1) / 100.);
                keyframes[currentFrame].set(x, y, colorChange);
            }
        }
    }

    @Override
    public void mouseMoved(MouseEvent e) {
    }
}
