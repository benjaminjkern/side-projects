package threed;

import java.awt.Color;
import java.awt.Graphics;
import java.util.HashMap;
import java.util.Map;

import kern.Tools;
import kern.Triplet;

public class Object3D {

    public Map<String, Object3D> objectsToDraw;
    public double[] pos;
    public double[] speed;
    public Color color;

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

    // ray marching ( Only works on certain shapes)
    public Triplet<Double, Color, LineObject> getDistToNearest(PointObject camera, int bounce, double epsilon) {
        Triplet<Double, Color, LineObject> closest = new Triplet<>(Double.MAX_VALUE, camera.color, null);
        return closest;
    }

    // ray casting
    public Triplet<Double, Color, LineObject> getFirstIntersect(LineObject ray, int bounce, double epsilon, String last,
            PointObject light) {

        Triplet<Double, Color, LineObject> closest = new Triplet<>(Double.MAX_VALUE, ray.color, null);
        String closestString = null;
        for (String s : objectsToDraw.keySet()) {
            Triplet<Double, Color, LineObject> intersect = objectsToDraw.get(s).getFirstIntersect(ray, bounce, epsilon,
                    last, light);
            if (intersect.x < closest.x && (intersect.x > epsilon || !s.equals(last))) {
                closest = intersect;
                closestString = s;
            }
        }
        if (bounce == 0 || closest.z == null) {
//            LineObject toLight = new LineObject(null, closest.z.pos, Tools.subtract(light.pos, closest.z.pos), 1);
//            if (getFirstIntersect(closest.z, -1, epsilon, last, light).x < Tools.magnitude(toLight.dirAndMag()))
//                return new Triplet<>(closest.x, Color.BLACK, null);
//            double brightness = Math.max(Tools.dotProduct(closest.z.dirAndMag(), toLight.unitDir()), 0);
//            double[] lightColor = Tools.add(Tools.mult(brightness, getColor(light.color)),
//                    Tools.mult((1 - brightness), getColor(closest.z.color)));
//            Color newColor = new Color(saturate(lightColor[0]), saturate(lightColor[1]), saturate(lightColor[2]));
//            return new Triplet<>(closest.x, newColor, null);
            return closest;
        }

        Triplet<Double, Color, LineObject> next = getFirstIntersect(closest.z, bounce - 1, epsilon, closestString,
                light);
        Color newColor = averageColors(closest.y, next.y);
        return new Triplet<>(closest.x, newColor, null);
    }

    public static int saturate(double a) { return (int) Math.min(255, Math.max(a, 0)); }

    public static double[] getColor(Color c) { return new double[] { c.getRed(), c.getGreen(), c.getBlue() }; }

    public static Color multiplyColors(Color light, Color object, double shininess) { return null; }

    public static Color averageColors(Color a, Color b) {
        return new Color((int) ((a.getRed() + b.getRed()) / 2.0), (int) ((a.getGreen() + b.getGreen()) / 2.0),
                (int) ((a.getBlue() + b.getBlue()) / 2.0));
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
        for (Object3D o : objectsToDraw.values()) o.translate(diff);
    }

    public void moveTo(double[] pos) {
        for (Object3D o : objectsToDraw.values()) o.translate(Tools.subtract(pos, this.pos));
        this.pos = pos;
    }

    /*
     * Construct different shapes!
     * 
     */
}