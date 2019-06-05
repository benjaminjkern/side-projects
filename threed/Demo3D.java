package threed;

import java.awt.Color;
import java.awt.Graphics;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;

import javax.swing.JFrame;
import kern.Game;
import kern.Tools;

public class Demo3D extends Game {

    private static final long serialVersionUID = 1L;
    

    public static void main(String[] args) {
        // Run UI in the Event Dispatcher Thread (EDT), instead of Main thread
        javax.swing.SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("YEUH");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            Demo3D game = new Demo3D(640,640);
            frame.setContentPane(game);
            frame.pack();
            frame.setVisible(true);
        });
    }
    
    private Object3D game;
    private LineObject camera;
    private double FOV;

    public Demo3D(int width, int height) {
        super(width, height);

        BACKGROUNDCOLOR = Color.BLACK;
        FOV = Math.PI/4;
        
        game = new Object3D();
        camera = new LineObject(null, new double[] {10, 0, 10}, new double[] {-1, 0, -1}, 1);

        game.add(Object3D.sphereObject(Color.PINK, 5, 64, 128));
        
        gameStart();
    }


    @Override
    protected void gameUpdate() {
        game.rotate(Tools.unitVector(new double[] {0,0,1}), -0.01);
        //game.translate(new double[] {-0.1, 0, 0});
        camera.translate(new double[] {-0.05,0,-0.05});
    }
    


    @Override
    protected void draw(Graphics g) {
        game.draw(g, camera, FOV, width, height);
    }
    
    

    @Override
    public void mouseClicked(MouseEvent e) {/**/}

    @Override
    public void mousePressed(MouseEvent e) {/**/}

    @Override
    public void mouseReleased(MouseEvent e) {/**/}

    @Override
    public void mouseEntered(MouseEvent e) {/**/}

    @Override
    public void mouseExited(MouseEvent e) {/**/}

    @Override
    public void keyTyped(KeyEvent e) {/**/}

    @Override
    public void keyPressed(KeyEvent e) {/**/}

    @Override
    public void keyReleased(KeyEvent e) {/**/}
}
