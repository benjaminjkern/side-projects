package threed;

//High key this might be the best thing I've made its so precise

import java.awt.Color;
import java.io.IOException;
import java.util.Random;

import kern.Animator;
import kern.Tensor;

public class Demo3D extends Animator {

    public static void main(String[] args) throws InterruptedException, IOException {
        Demo3D d = new Demo3D(100, 100, 200);
        d.go();
    }

    public Object3D game;
    public LineObject camera;
    public PointObject light;
    public double fov;
    public Color bgColor;
    public final static int id = new Random().nextInt(Integer.MAX_VALUE);

    public Demo3D(int width, int height, int frames) {
        super(width, height, 1, "Ray Tracer " + id, frames);

        bgColor = Color.WHITE;

        fov = Math.PI / 4;

        game = new Object3D();
        camera = new LineObject(Color.CYAN, new double[] { 3, 0, 3 }, new double[] { -3, 0, -2 }, 1);
        light = new PointObject(Color.WHITE, new double[] { 0, 0, 10 });

        game.add(PolyObject.planeObject(Color.BLACK, new double[] { 0, 0, 0 }, new double[] { 0, 0, 1 }));

//        game.add("cone", CompoundObject.coneObject(Color.GREEN, new double[] { 0, 0, 1 }));
//        game.add("ground", PolyObject.planeObject(Color.BLACK, new double[] { 0, 0, 0 }, new double[] { 0, 0, 1 }));
        game.add(new PolyObject(Color.GREEN, Tensor.rand(-1, 1, new int[] { 1 }).index(),
                Tensor.rand(-1, 1, new int[] { 3 }).index("a"), Tensor.rand(-1, 1, new int[] { 3, 3 }).index("a", "b"),
                Tensor.rand(-1, 1, new int[] { 3, 3, 3 }).index("a", "b", "c")));
//        game.add("cuck", PolyObject.sphereObject(Color.RED, new double[] { 0, 0, 1 }, 1));
//        game.add("cuck2", PolyObject.sphereObject(Color.GREEN, new double[] { 2, 0, 1 }, 0.5));

//        for (int i = 0; i < 10; i++) {
//            game.add(CompoundObject.cubeObject(Color.getHSBColor((float) Math.random(), 1, 1), Tools.rand(-2, 2, 3)));
//        }

        writeToGif = "/Users/benkern/3Danimation" + id + ".gif";

        keyframes[currentFrame] = new ThreeDFrame(width, height, this, null);
    }

    public void update() {

        camera.rotate(new double[] { 0, 0, 1 }, new double[] { 0, 0, 0 }, -2 * Math.PI / (keyframes.length - 1));

//        Object3D cone = game.objectsToDraw.get("cone");
//        cone.translate(new double[] { 0, 0, 0.01 });
        // bounce greenball
        // SphereObject myBall = (SphereObject) game.objectsToDraw.get("greenball");
        // myBall.speed = Tools.add(myBall.speed, new double[] { 0, 0, -0.01 });
        // myBall.translate(myBall.speed);
        // if (myBall.pos[2] < myBall.radius) {
        // myBall.speed[2] = -myBall.speed[2];
        // myBall.moveTo(new double[] { myBall.pos[0], myBall.pos[1], myBall.radius });
        // }
    }
}
