package threed;

import java.awt.Color;
import java.awt.Graphics;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import kern.Tools;

public class Object3D {

    public Map<String, Object3D> objectsToDraw;
    public double[] pos;
    public double[] speed;

    public Object3D() {
        pos = new double[] { 0, 0, 0 };
        speed = new double[] { 0, 0, 0 };
        objectsToDraw = new HashMap<>();
    }

    public Object3D(double[] pos) {
        this.pos = pos;
        speed = new double[] { 0, 0, 0 };
        objectsToDraw = new HashMap<>();
    }

    public void wireFrameDraw(Graphics g, LineObject camera, double FOV, double stageWidth, double stageHeight) {
        for (Object3D o : objectsToDraw.values()) o.wireFrameDraw(g, camera, FOV, stageWidth, stageHeight);
    }

    public int rayMarchDraw(int bgColor, int bounce, LineObject light, LineObject camera, Object3D bounceOff,
            double maxThreshold, double minThreshold, int stepThreshold) {
        LineObject marcher = camera;
        int step = 0;
        while (step < stepThreshold) {
            ClosestColor closest = getDist(marcher, bounceOff);

            if (closest.dist > maxThreshold || bounce == 0) return getLitColor(bgColor, marcher.dirAndMag(), light);
            if (closest.dist < minThreshold) return averageColor(closest.color, rayMarchDraw(bgColor, bounce - 1, light,
                    bounceRay(closest.object, marcher), closest.object, maxThreshold, minThreshold, stepThreshold));

            marcher.setLength(closest.dist);
            marcher.step();
            step++;
        }
        return getLitColor(bgColor, marcher.dirAndMag(), light);
    }

    public int getLitColor(int bgColor, double[] mDir, LineObject light) {
        double a = (1 + aligns(mDir, light.dirAndMag())) / 2;
        return averageColor(new int[] { bgColor, light.color.getRGB() }, new double[] { a, 1 - a });
    }

    public double aligns(double[] a, double[] b) { return Tools.dotProduct(Tools.unitVector(a), Tools.unitVector(b)); }

    private int averageColor(int... colors) {
        int sumRed = 0, sumGreen = 0, sumBlue = 0;
        for (int i = 0; i < colors.length; i++) {
            Color thisColor = new Color(colors[i]);
            sumRed += thisColor.getRed();
            sumGreen += thisColor.getGreen();
            sumBlue += thisColor.getBlue();
        }
        return new Color(sumRed / colors.length, sumGreen / colors.length, sumBlue / colors.length).getRGB();
    }

    private int averageColor(int[] colors, double[] amounts) {
        int sumRed = 0, sumGreen = 0, sumBlue = 0;
        for (int i = 0; i < colors.length; i++) {
            Color thisColor = new Color(colors[i]);
            sumRed += thisColor.getRed() * amounts[i];
            sumGreen += thisColor.getGreen() * amounts[i];
            sumBlue += thisColor.getBlue() * amounts[i];
        }
        double sum = Tools.sum(amounts);
        return new Color((int) (sumRed / sum), (int) (sumGreen / sum), (int) (sumBlue / sum)).getRGB();
    }

    public void add(String name, Object3D object) {
        object.translate(pos);
        objectsToDraw.put(name, object);
    }

    public void add(Object3D object) { add("" + new java.util.Random().nextInt(Integer.MAX_VALUE), object); }
    /*
     * for manipulating the current object
     * 
     */

    public void rotate(double[] u, double angle) {
        double c = Math.cos(angle);
        double s = Math.sin(angle);
        double[][] R = new double[][] {
                new double[] { c + u[0] * u[0] * (1 - c), -u[2] * s + u[0] * u[1] * (1 - c),
                        u[1] * s + u[0] * u[2] * (1 - c) },
                new double[] { u[2] * s + u[0] * u[1] * (1 - c), c + u[1] * u[1] * (1 - c),
                        -u[0] * s + u[1] * u[2] * (1 - c) },
                new double[] { -u[1] * s + u[0] * u[2] * (1 - c), u[0] * s + u[1] * u[2] * (1 - c),
                        c + u[2] * u[2] * (1 - c) } };
        rotate(R, pos);
    }

    public void rotate(double[] u, double[] root, double angle) {
        double c = Math.cos(angle);
        double s = Math.sin(angle);
        double[][] R = new double[][] {
                new double[] { c + u[0] * u[0] * (1 - c), -u[2] * s + u[0] * u[1] * (1 - c),
                        u[1] * s + u[0] * u[2] * (1 - c) },
                new double[] { u[2] * s + u[0] * u[1] * (1 - c), c + u[1] * u[1] * (1 - c),
                        -u[0] * s + u[1] * u[2] * (1 - c) },
                new double[] { -u[1] * s + u[0] * u[2] * (1 - c), u[0] * s + u[1] * u[2] * (1 - c),
                        c + u[2] * u[2] * (1 - c) } };
        rotate(R, root);
    }

    public void rotate(double[][] R, double[] root) {
        pos = Tools.add(Tools.mult(R, Tools.subtract(pos, root)), root);
        for (Object3D o : objectsToDraw.values()) o.rotate(R, root);
    }

    public void translate(double[] diff) {
        pos = Tools.add(pos, diff);
        // for (Object3D o: objectsToDraw) o.translate(diff);
    }

    public void moveTo(double[] pos) {
        for (Object3D o : objectsToDraw.values()) o.translate(Tools.subtract(pos, this.pos));
        this.pos = pos;
    }

    /*
     * Construct different shapes!
     * 
     */

    public static Object3D cubeObject(Color color, double[] pos, double x, double y, double z) {
        Object3D cube = new Object3D(pos);
        cube.add(new LineObject(color, new double[] {}, new double[] {}));
        return cube;
    }

    public static Object3D sphereObject(Color color, double radius, int iMax, int jMax) {
        return new SphereObject(color, new double[] { 0, 0, 0 }, radius, iMax, jMax);
    }

    public ClosestColor getDist(LineObject marcher, Object3D bounceOff) {
        ClosestColor minDist = new ClosestColor(Double.MAX_VALUE, 0, null);
        Set<Object3D> adjustedSet = new HashSet<>(objectsToDraw.values());
        adjustedSet.remove(bounceOff);
        for (Object3D o : adjustedSet) {
            ClosestColor dist = o.getDist(marcher, bounceOff);
            if (dist.dist < minDist.dist) minDist = dist;
        }
        return minDist;
    }

    double[] normal(double[] pos) { return pos; }

    static LineObject bounceRay(Object3D object, LineObject ray) {
        double[] r = ray.dirAndMag();
        double[] normal = object.normal(ray.pos);
        return new LineObject(null, ray.pos,
                Tools.add(ray.pos, Tools.add(r, Tools.mult(normal, -2 * Tools.dotProduct(normal, r)))));
    }

    protected class ClosestColor {
        double dist;
        int color;
        Object3D object;

        ClosestColor(double dist, int color, Object3D object) {
            this.dist = dist;
            this.color = color;
            this.object = object;
        }
    }
}