package neuralnets.test;

import java.awt.Color;
import java.io.IOException;

import kern.Animator;
import kern.Keyframe;
import kern.Tools;
import neuralnets.NeuralNet;

public class Test extends Animator {

    public static void main(String[] args) throws InterruptedException, IOException {
        Test d = new Test(640, 640, 1000);
        d.go();
    }

    public double[] area;
    public Point[] dots;
    public double[][] dotInputs;
    public double[][] dotOutputs;

    private NeuralNet best;
    private double score;

    public Test(int width, int height, int frames) {
        super(width, height, 1, "NeuralNet", frames);

        area = new double[] { -1, 1, -1, 1 };
        best = new NeuralNet(2, 10, 1, 3);
        score = Double.MAX_VALUE;

        int points = 20;
        dots = new Point[points];
        dotInputs = new double[points][2];

        dotOutputs = new double[points][3];
        for (int i = 0; i < points; i++) {
            dots[i] = new Point(area);
            dotInputs[i] = dots[i].pos;
            dotOutputs[i] = dots[i].color;
        }

        keyframes[currentFrame] = new CoolFrame(width, height, null, this);

        writeToGif = "/Users/benkern/yeuh.gif";
    }

    public double test(NeuralNet n) {
        double sumError = 0;
        for (Point dot : dots) {
            double[] p = Tools.subtract(n.propagate(dot.pos), dot.color);
            sumError += 0.5 * Tools.dotProduct(p, p);
        }
        if (sumError < score) {
            score = sumError;
            System.out.println(score);
            best = n;
        }
        return sumError;
    }

    public Integer predetermined(double[] pos) {
        for (Point dot : dots) { if (Tools.magnitude(Tools.subtract(pos, dot.pos)) < 0.01) return dot.getColor(); }
        return null;
    }

    public Integer predetermined(int x, int y) { return null; }

    static class Point {
        double[] pos;
        double[] color;

        Point(double[] range) {
            pos = new double[] { Math.random() * (range[1] - range[0]) + range[0],
                    Math.random() * (range[1] - range[0]) + range[0] };
            color = Math.random() > 0.5 ? new double[] { 1, 1, 1 } : new double[] { 0, 0, 0 };
//            color = Tools.rand(0, 1, 3);
        }

        int getColor() { return getColor(color); }

        private static int colorCap(double value) { return (int) Math.max(Math.min(value * 255, 255), 0); }

        static int getColor(double[] color) {
            return new Color(colorCap(color[0]), colorCap(color[1]), colorCap(color[2])).getRGB();
        }
    }

    class CoolFrame extends Keyframe {

        private Test wrapper;
        public double score;

        CoolFrame(int width, int height, CoolFrame parent, Test wrapper) {
            super(width, height, parent);

            this.wrapper = wrapper;
//            wrapper.best.backPropagate(wrapper.dotOutputs, wrapper.dotInputs, 0.01);
            NeuralNet net = new NeuralNet(wrapper.best, 1);
            score = wrapper.test(net);

            if (score == wrapper.score || parent == null) {
                for (double y = 0; y < height; y++) {
                    for (double x = 0; x < width; x++) {
                        double[] newPos = new double[] {
                                x * (wrapper.area[1] - wrapper.area[0]) / width + wrapper.area[0],
                                y * (wrapper.area[3] - wrapper.area[2]) / height + wrapper.area[2] };

                        Integer pred = wrapper.predetermined(newPos);
                        if (pred == null) {
                            grid[(int) y][(int) x] = Point.getColor(net.propagate(newPos));
                        } else grid[(int) y][(int) x] = pred;
                    }
                }
            } else grid = parent.grid;
        }

        @Override
        public CoolFrame nextFrame() {
            while (next == null || ((CoolFrame) next).score > wrapper.score)
                next = new CoolFrame(width, height, this, wrapper);
            return (CoolFrame) next;
        }
    }
}
