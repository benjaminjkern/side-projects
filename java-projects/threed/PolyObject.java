package threed;

import java.awt.Color;

import kern.IndexedTensor;
import kern.Tensor;
import kern.Tools;
import kern.Triplet;

public class PolyObject extends Object3D {

    IndexedTensor[] tensors;

    public PolyObject(Color c, IndexedTensor... tensors) {
        super();
        this.color = c;
        this.tensors = tensors;
    }

    public PolyObject(Color c, double[] pos, IndexedTensor... tensors) {
        super(pos);
        this.color = c;
        this.tensors = tensors;
    }

    @Override
    public Triplet<Double, Color, LineObject> getFirstIntersect(LineObject ray, int bounce, double epsilon, String last,
            PointObject light) {
        Triplet<Double, Color, LineObject> closest = new Triplet<>(Double.MAX_VALUE, ray.color, null);

        Tensor T = new Tensor(ray.dirAndMag());
        Tensor P = new Tensor(Tools.subtract(ray.pos, pos));

        double[] coefficients = new double[tensors.length];

        for (int bits = 0; bits < tensors.length; bits++) {
            for (int bit = 0; bit < Math.pow(2, bits); bit++) {
                IndexedTensor prod = tensors[bits];
                for (int j = 0; j < bits; j++) {
                    String currentIndex = tensors[bits].indices.get(j);
                    prod = IndexedTensor.mult(prod, (((bit >>> j) & 1) == 0 ? P : T).index(currentIndex))
                            .sum(currentIndex);
                }
                coefficients[countBits(bit)] += prod.item();
            }
        }
        Tools.println(coefficients);

        double[] intersections = Tools.findZeros(coefficients);
        double dist = Double.MAX_VALUE;
        for (double d : intersections) { if (d > epsilon && d < dist) dist = d; }
        if (dist == Double.MAX_VALUE) return closest;

        if (bounce == 0) return new Triplet<>(dist, color, null);

        double[] newPos = Tools.add(ray.pos, Tools.mult(T.flatten(), dist));
        Tensor newP = new Tensor(Tools.subtract(newPos, pos));

        double[] normal = new double[3];
        for (int t = 1; t < tensors.length; t++) {
            for (int x = 0; x < t; x++) {
                IndexedTensor prod = tensors[t];
                for (int r = 0; r < t; r++) {
                    if (r != x) {
                        String currentIndex = tensors[t].indices.get(r);
                        prod = IndexedTensor.mult(prod, newP.index(currentIndex)).sum(currentIndex);
                    }
                }
                normal = Tools.add(normal, prod.flatten());
            }
        }

        double[] newDir = Tools.add(T.flatten(),
                Tools.mult(normal, -2 * Tools.dotProduct(normal, T.flatten()) / Tools.dotProduct(normal, normal)));

        return new Triplet<>(dist, color, new LineObject(ray.color, newPos, newDir, 1));
    }

    public static int countBits(int n) {
        int count = 0;
        while (n > 0) {
            count += n & 1;
            n >>= 1;
        }
        return count;
    }

    // Theoretically possible and I could totally sit down and do the math
    // explicitly for polynomial surfaces up to 2 but I dont wanna
    @Override
    public Triplet<Double, Color, LineObject> getDistToNearest(PointObject camera, int bounce, double epsilon) {
        return null;
        // TODO: Implement
    }

    public double func(double[] x) {
        Tensor P = new Tensor(Tools.subtract(x, pos));
        double sum = 0;
        for (int t = 0; t < tensors.length; t++) {
            IndexedTensor prod = tensors[t];
            for (int j = 0; j < t; j++) { prod = IndexedTensor.mult(prod, P.index(tensors[t].indices.get(j))); }
            sum += prod.item();
        }
        return sum;
    }

    public static PolyObject sphereObject(Color color, double[] pos, double radius) {
        return new PolyObject(color, pos, new Tensor(-radius * radius).index(),
                Tensor.zeros(new int[] { 3 }).index("a"),
                new Tensor(new int[] { 3, 3 }, new double[] { 1, 0, 0, 0, 1, 0, 0, 0, 1 }).index("a", "b"));
    }

    public static PolyObject planeObject(Color color, double[] pos, double[] perp) {
        return new PolyObject(color, pos, new Tensor(0).index(), new Tensor(perp).index("a"));
    }

    public static PolyObject cylinderObject(Color color, double[] pos, double[] u, double radius) {
        return new PolyObject(color, pos, new Tensor(-radius * radius).index(),
                Tensor.zeros(new int[] { 3 }).index("a"),
                new Tensor(new int[] { 3, 3 }, new double[] { 1 - u[0] * u[0], -2 * u[0] * u[1], -2 * u[0] * u[2], 0,
                        1 - u[1] * u[1], -2 * u[1] * u[2], 0, 0, 1 - u[2] * u[2] }).index("a", "b"));
    }

    public static PolyObject coneObject(Color color, double[] pos, double[] u, double m) {
        return new PolyObject(color, pos, new Tensor(0).index(), Tensor.zeros(new int[] { 3 }).index("a"),
                new Tensor(new int[] { 3, 3 },
                        new double[] { m * m * (1 - 2 * u[0] * u[0]), -4 * (m * m + 1) * u[0] * u[1],
                                -4 * (m * m + 1) * u[0] * u[2], 0, m * m * (1 - 2 * u[1] * u[1]),
                                -4 * (m * m + 1) * u[1] * u[2], 0, 0, m * m * (1 - 2 * u[2] * u[2]) }).index("a", "b"));
    }

}
