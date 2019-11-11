package kern;

import java.awt.BorderLayout;
import java.awt.Graphics;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.stream.FileImageOutputStream;
import javax.imageio.stream.ImageOutputStream;
import javax.swing.JFrame;
import javax.swing.JPanel;

public class Animator implements MouseListener, KeyListener {

    public static final int DEFAULT_COLOR = 0x000000;
    protected static final int DEFAULT_KEEP = 100000;

    // protected static final double FPS = 60;

    protected boolean loop;

    protected String writeToGif;

    protected int keepFrameAmount;
    protected Keyframe[] keyframes;
    private boolean sDown, spDown;
    protected boolean running, forward, backward, animating;
    protected int currentFrame, frontier;
    protected int width, height, pixelSize;
    protected Keyframe frontierFrame;
    protected boolean reset;

    protected final Map<Integer, Integer> colorMap;

    protected JFrame frame;

    BufferedImage bi;

    public Animator(int width, int height, int pixelSize, String title, int keep) {
        loop = false;
        keepFrameAmount = keep;
        running = true;
        animating = true;
        forward = false;
        backward = false;
        sDown = spDown = false;
        bi = new BufferedImage(width * pixelSize, height * pixelSize, BufferedImage.TYPE_INT_RGB);

        colorMap = new HashMap<>();

        // setup JFrame stufferoo
        frame = new JFrame(title);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.getContentPane().add(BorderLayout.CENTER, new DrawPanel());
        frame.setResizable(false);
        frame.setSize(width * pixelSize, height * pixelSize + 22);
        frame.setLocationByPlatform(true);
        frame.setVisible(true);

        frame.addMouseListener(this);
        frame.addKeyListener(this);
        frame.setFocusable(true);
        frame.requestFocus();

        currentFrame = 0;
        frontier = 0;

        writeToGif = "";

        this.pixelSize = pixelSize;
        this.width = width;
        this.height = height;

        keyframes = new Keyframe[keepFrameAmount < 0 ? DEFAULT_KEEP : keepFrameAmount];
    }

    public void gotoFrame(int toFrame) {
        currentFrame = toFrame;
        drawFrame(keyframes[currentFrame]);
    }

    public void go() throws InterruptedException, IOException {

        ImageOutputStream output = new FileImageOutputStream(new File(writeToGif));
        GifSequenceWriter writer = new GifSequenceWriter(output, bi.getType(), 0, true);

        while (frame.isEnabled()) {
            if (running) {
                int oldFrame = currentFrame;
                currentFrame = (currentFrame + 1) % keepFrameAmount;
                if (keyframes[currentFrame] == null || loop) {
                    keyframes[currentFrame] = keyframes[oldFrame].nextFrame();
                    // System.out.println("Created Frame " + currentFrame);
                }
            }

            if (forward && !backward) {
                int newFrame = (currentFrame + 1) % keepFrameAmount;
                if (keyframes[newFrame] != null) currentFrame = newFrame;
            }

            if (backward && !forward) {
                int newFrame = (currentFrame + keepFrameAmount - 1) % keepFrameAmount;
                if (keyframes[newFrame] != null) currentFrame = newFrame;
            }

            changeFrame();

            if (animating || !writeToGif.isEmpty()) {
                drawFrame(keyframes[currentFrame]);
                if (!writeToGif.isBlank()) {
                    keyframes[currentFrame - 1] = null;
                    writer.writeToSequence(bi);
                }
            }
            Thread.sleep(1);
        }

        writer.close();
        output.close();
    }

    public void changeFrame() {}

    public void drawFrame(Keyframe k) {
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                for (int px = 0; px < pixelSize; px++) {
                    for (int py = 0; py < pixelSize; py++) {
                        bi.setRGB(x * pixelSize + px, y * pixelSize + py,
                                colorMap.containsKey(k.grid[y][x]) ? colorMap.get(k.grid[y][x]) : k.grid[y][x]);
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
        public void paintComponent(Graphics g) { g.drawImage(bi, 0, 0, null); }
    }

    @Override
    public void keyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_A) {
            running = false;
            backward = true;
        } else if (e.getKeyCode() == KeyEvent.VK_D) {
            running = false;
            forward = true;
        } else if (e.getKeyCode() == KeyEvent.VK_R) {
            currentFrame = 0;
            running = true;
            animating = true;
        } else if (e.getKeyCode() == KeyEvent.VK_S) {
            if (!sDown) animating = !animating;
            sDown = true;
        } else if (e.getKeyCode() == KeyEvent.VK_SPACE) {
            if (!spDown) running = !running;
            spDown = true;
        }
        System.out.println((animating ? "" : "Not ") + "Animating");
        System.out.println((running ? "" : "Not ") + "Running");
    }

    @Override
    public void keyReleased(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_A) {
            backward = false;
        } else if (e.getKeyCode() == KeyEvent.VK_D) {
            forward = false;
        } else if (e.getKeyCode() == KeyEvent.VK_S) {
            sDown = false;
        } else if (e.getKeyCode() == KeyEvent.VK_SPACE) { spDown = false; }
    }

    @Override
    public void keyTyped(KeyEvent e) {}

    @Override
    public void mouseClicked(MouseEvent e) {}

    @Override
    public void mousePressed(MouseEvent e) {}

    @Override
    public void mouseReleased(MouseEvent e) {}

    @Override
    public void mouseEntered(MouseEvent e) {}

    @Override
    public void mouseExited(MouseEvent e) {}
}
