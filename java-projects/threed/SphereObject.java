package threed;

import java.awt.Color;

import kern.Tools;
import kern.Triplet;

public class SphereObject extends Object3D {

    // still works as PolyObject, but its faster just to do it this way

    double radius;

    public SphereObject(Color color, double[] pos, double radius) {
        super(pos);
        this.color = color;
        this.radius = radius;

    }

    @Override
    public Triplet<Double, Color, LineObject> getFirstIntersect(LineObject ray, int bounce, double epsilon,
            String last) {
        Triplet<Double, Color, LineObject> closest = new Triplet<>(Double.MAX_VALUE, ray.color, null);

        double[] T = ray.dirAndMag();
        double[] P = Tools.subtract(ray.pos, pos);

        double a = Tools.dotProduct(P, P) - radius * radius;
        double b = 2 * Tools.dotProduct(T, P);
        double c = Tools.dotProduct(T, T);

        if (c == 0) throw new Error("That shouldn't have happened");

        double dist;

        double discriminant = Math.pow(b, 2) - 4 * a * c;
        if (discriminant < 0) return closest;

        double yeuh = Math.sqrt(discriminant) / 2. / c;
        double fuh = -b / 2. / c;
        if (fuh - yeuh < 0) {
            if (fuh + yeuh < 0) return closest;
            dist = fuh + yeuh;
        } else if (fuh + yeuh < 0) dist = fuh + yeuh;
        else dist = Math.min(fuh - yeuh, fuh + yeuh);

        double[] newPos = Tools.add(ray.pos, Tools.mult(T, dist));
        double[] normal = Tools.subtract(newPos, pos);
        double[] newDir = Tools.add(T,
                Tools.mult(normal, -2 * Tools.dotProduct(normal, T) / Tools.dotProduct(normal, normal)));

        return new Triplet<>(dist, color, new LineObject(ray.color, newPos, newDir, 1));
    }

    // this is why we do this
    @Override
    public Triplet<Double, Color, LineObject> getDistToNearest(PointObject camera, int bounce, double epsilon) {
        return null;
        // TODO: Implement
    }

}
