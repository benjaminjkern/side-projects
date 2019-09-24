package threed;

//High key this might be the best thing I've made its so precise

import java.awt.Color;
import java.io.IOException;

import kern.Animator;
import kern.Tools;

public class Demo3D extends Animator {

    public static void main(String[] args) throws InterruptedException, IOException {
        Demo3D d = new Demo3D(640, 640, 1000);
        d.go();
    }

    public Object3D game;
    public LineObject camera;
    public LineObject light;
    public double fov;

    public Demo3D(int width, int height, int frames) {
        super(width, height, 1, "Ray Marcher", frames);

        fov = Math.PI / 4;

        game = new Object3D();
        camera = new LineObject(null, new double[] { 20, 0, 5 }, new double[] { -20, 0, -5 }, 1);

        game.add("greenball", new SphereObject(Color.GREEN, new double[] { 0, 0, 10 }, 2, 8, 8));
        game.add("pinkball", new SphereObject(Color.PINK, new double[] { 0, 10, 3 }, 3, 8, 8));
        game.add("redball", new SphereObject(Color.RED, new double[] { 8, -2, 0.5 }, 0.5, 8, 8));

        game.add("ground", new PlaneObject(Color.BLACK, new double[] { 0, 0, 0 },
                new double[][] { new double[] { 1, 0, 0 }, new double[] { 0, 1, 0 } }, 50, 50));

        /*
         * game.add("ceiling", new PlaneObject(Color.WHITE, new double[] { 0, 0, 50 },
         * new double[][] { new double[] { 1, 0, 0 }, new double[] { 0, 1, 0 } }, 50,
         * 50));
         * 
         * game.add("backwall", new PlaneObject(Color.BLACK, new double[] { -25, 0, 25
         * }, new double[][] { new double[] { 0, 0, 1 }, new double[] { 0, 1, 0 } }, 50,
         * 50)); game.add("leftwall", new PlaneObject(Color.BLACK, new double[] { 0, 25,
         * 25 }, new double[][] { new double[] { 0, 0, 1 }, new double[] { 1, 0, 0 } },
         * 50, 50)); game.add("righwall", new PlaneObject(Color.BLACK, new double[] { 0,
         * -25, 25 }, new double[][] { new double[] { 0, 0, 1 }, new double[] { 1, 0, 0
         * } }, 50, 50)); game.add("behindwall", new PlaneObject(Color.BLACK, new
         * double[] { 25, 0, 25 }, new double[][] { new double[] { 0, 0, 1 }, new
         * double[] { 0, 1, 0 } }, 50, 50));
         */
        writeToGif = "/Users/benkern/3Danimation.gif";

        keyframes[currentFrame] = new ThreeDFrame(width, height, this, null);
    }

    public void update() {
        // bounce greenball
        SphereObject myBall = (SphereObject) game.objectsToDraw.get("greenball");
        myBall.speed = Tools.add(myBall.speed, new double[] { 0, 0, -0.01 });
        myBall.translate(myBall.speed);
        camera.rotate(new double[] { 0, 0, 1 }, new double[] { 0, 0, 0 }, 0.01);
        if (myBall.pos[2] < myBall.radius) {
            myBall.speed[2] = -myBall.speed[2];
            myBall.moveTo(new double[] { myBall.pos[0], myBall.pos[1], myBall.radius });
        }
    }
}
