package threed;

import java.awt.Color;

import kern.Tools;
import kern.Triplet;

public class CompoundObject extends Object3D {
    public CompoundObject(double[] pos, PolyObject... objects) { for (PolyObject p : objects) add(p); }

    @Override
    public Triplet<Double, Color, LineObject> getFirstIntersect(LineObject ray, int bounce, double epsilon,
            String last) {

        Triplet<Double, Color, LineObject> closest = new Triplet<>(Double.MAX_VALUE, ray.color, null);
        String closestString = null;

        for (String s : objectsToDraw.keySet()) {
            Triplet<Double, Color, LineObject> intersect = objectsToDraw.get(s).getFirstIntersect(ray, bounce, epsilon,
                    last);
            if (intersect.z != null) {
                for (String t : objectsToDraw.keySet()) {
                    if (t.equals(s)) continue;
                    PolyObject m = (PolyObject) objectsToDraw.get(t);
                    if (m.func(intersect.z.pos) > 0) {
                        intersect = closest;
                        break;
                    }
                }
                if (!s.equals(last) && intersect.x < closest.x) {
                    closest = intersect;
                    closestString = s;
                }
            }
        }
        return closest;
    }

    public static CompoundObject cubeObject(Color color, double[] pos) {
        return new CompoundObject(pos,
                PolyObject.planeObject(color, Tools.add(pos, new double[] { 1, 0, 0 }), new double[] { 1, 0, 0 }),
                PolyObject.planeObject(color, Tools.add(pos, new double[] { -1, 0, 0 }), new double[] { -1, 0, 0 }),
                PolyObject.planeObject(color, Tools.add(pos, new double[] { 0, 0, 1 }), new double[] { 0, 0, 1 }),
                PolyObject.planeObject(color, Tools.add(pos, new double[] { 0, 0, -1 }), new double[] { 0, 0, -1 }),
                PolyObject.planeObject(color, Tools.add(pos, new double[] { 0, -1, 0 }), new double[] { 0, -1, 0 }),
                PolyObject.planeObject(color, Tools.add(pos, new double[] { 0, 1, 0 }), new double[] { 0, 1, 0 }));
    }

    public static CompoundObject coneObject(Color color, double[] pos) {
        return new CompoundObject(pos, PolyObject.coneObject(color, pos, new double[] { 0, 0, -1 }, 1),
                PolyObject.planeObject(color, Tools.add(pos, new double[] { 0, 0, -1 }), new double[] { 0, 0, -1 }),
                PolyObject.planeObject(color, Tools.add(pos, new double[] { 0, 0, 0 }), new double[] { 0, 0, 1 }));

    }
}
