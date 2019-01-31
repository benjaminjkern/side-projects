package kern;

import java.util.ArrayList;

public class Animator {
    
    private static final long serialVersionUID = 1L;

    public static final int DEFAULT_COLOR = 0xffffff;

    protected ArrayList<Keyframe> keyframes;
    protected boolean running;
    protected int currentFrame;

    public int width, height;

    JFrame frame;

    BufferedImage bi;
    
    public Animator(int width, int height, String title) {
        
        running = true;

        // setup JFrame stufferoo
        frame = new JFrame(title);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.getContentPane().add(BorderLayout.CENTER, new DrawPanel());
        frame.setResizable(false);
        frame.setSize(width, height + 22);
        frame.setLocationByPlatform(true);
        frame.setVisible(true);
        
        keyframes = new ArrayList<Keyframe>();
        currentFrame = 0;
    }

    public void stop() {
        running = false;
    }

    public void start() {
        if (!running) {
            // to prevent recursive loops
            running = true;
            animate();
        }
    }

    public void gotoFrame(int toFrame) {
        currentFrame = toFrame;
    }
    
    public void animate() {
        while (running) {
            keyframes.get(currentFrame).set();
            frame.repaint();
            currentFrame++;

            Thread.sleep(1);
        }
    }

    public void addFrame(KeyFrame k) {
        keyframes.add(k);
    }

    public void drawFrame() {
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                bi.setRGB(x,y,grid[y][x]);
            }
        }
        frame.repaint();
    }

    // may or may not actually be necessary tbh
    class DrawPanel extends JPanel {
        private static final long serialVersionUID = 1L;

        public void paintComponent(Graphics g) {
            g.drawImage(bi, 0, 0, null);
        }
    }
}
