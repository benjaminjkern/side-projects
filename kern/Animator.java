package kern;

import java.awt.BorderLayout;
import java.awt.Graphics;
import java.awt.event.KeyListener;
import java.awt.event.MouseListener;
import java.awt.image.BufferedImage;
import javax.swing.JFrame;
import javax.swing.JPanel;

import cellularautomata.CellularAutomataFrame;

public abstract class Animator implements MouseListener, KeyListener {

    public static final int DEFAULT_COLOR = 0xff0000;
    protected static final int DEFAULT_KEEP = 100000;

    public final int KEEP_AMOUNT;

    protected Keyframe[] keyframes;
    protected boolean running;
    protected boolean animating;
    protected int currentFrame, frontier;
    protected int width, height, pixelSize;
    protected Keyframe frontierFrame;
    protected boolean resetFrame;

    protected JFrame frame;

    BufferedImage bi;

    public Animator(int width, int height, int pixelSize, String title, int keep) {
        KEEP_AMOUNT = keep;
        running = true;
        animating = true;
        bi = new BufferedImage(width*pixelSize, height*pixelSize, BufferedImage.TYPE_INT_RGB);

        // setup JFrame stufferoo
        frame = new JFrame(title);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.getContentPane().add(BorderLayout.CENTER, new DrawPanel());
        frame.setResizable(false);
        frame.setSize(width*pixelSize, height*pixelSize + 22);
        frame.setLocationByPlatform(true);
        frame.setVisible(true);

        frame.addMouseListener(this);
        frame.addKeyListener(this);
        frame.setFocusable(true);
        frame.requestFocus();

        currentFrame = 0;
        frontier = 0;

        this.pixelSize = pixelSize;
        this.width = width;
        this.height = height;

        keyframes = new Keyframe[KEEP_AMOUNT < 0 ? DEFAULT_KEEP:KEEP_AMOUNT];
    }

    public void gotoFrame(int toFrame) {
        currentFrame = toFrame;
        drawFrame(keyframes[currentFrame]);
    }

    public void go() throws InterruptedException {
        while (frame.isEnabled()) {
            if (animating) {
                keyframes[frontier] = frontierFrame;
                frontierFrame = keyframes[frontier].next();
                frontier = (frontier+1)%KEEP_AMOUNT;
            }

            if (running) {
                drawFrame(keyframes[currentFrame]);
                currentFrame = (currentFrame+1)%KEEP_AMOUNT;
            }
            
            if (resetFrame) {
                resetFrame = false;
                keyframes = new Keyframe[KEEP_AMOUNT < 0 ? DEFAULT_KEEP:KEEP_AMOUNT];
                currentFrame = 0;
                frontier = 0;
            }
            
            changeFrame();

            //System.out.println("Frontier: "+frontier+", Current Frame: "+currentFrame);

            Thread.sleep(1);
        }
    }
    
    public abstract void changeFrame();

    public void addFrame(Keyframe k) {
        keyframes[frontier] = k;
    }

    public void drawFrame(Keyframe k) {
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                for (int px = 0; px<pixelSize;px++) {
                    for (int py = 0; py<pixelSize;py++) {
                        bi.setRGB(x*pixelSize+px,y*pixelSize+py,k.colorMap.get(k.grid[y][x]));
                    }
                }
            }
        }
        frame.repaint();
    }

    // may or may not actually be necessary tbh
    class DrawPanel extends JPanel {
        private static final long serialVersionUID = 1L;

        @Override
        public void paintComponent(Graphics g) {
            g.drawImage(bi, 0, 0, null);
        }
    }
}
