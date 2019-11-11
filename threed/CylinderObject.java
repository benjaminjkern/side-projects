package threed;

import java.awt.Color;

import kern.Tools;

public class CylinderObject extends Object3D {
    Color color;
    double radius;
    double[] dirAndMag;

    public CylinderObject(Color color, double[] pos, double[] dir, double height, double radius) {
        super(pos);
        this.color = color;
        this.radius = radius;
        this.dirAndMag = dir;
    }

    public CylinderObject(Color color, LineObject base, double radius) {
        super(base.pos);
        this.color = color;
        this.radius = radius;
        this.dirAndMag = base.dirAndMag();
    }

    @Override
    public ClosestColor getDist(LineObject marcher, Object3D bounceOff) {
        double[] diff = Tools.subtract(pos, marcher.pos);
        double[] perp = Tools.mult(Tools.dotProduct(dirAndMag, diff), dirAndMag);
        double[] proj = Tools.subtract(diff, perp);
        double discriminant = radius * radius
                - Math.pow(Tools.magnitude(Tools.crossProduct(proj, marcher.unitDir())), 2);
        if (discriminant < 0 || Tools.dotProduct(proj, marcher.dirAndMag()) < 0)
            return new ClosestColor(Double.MAX_VALUE, 0, this);
        return new ClosestColor(Tools.dotProduct(proj, marcher.unitDir()) - Math.sqrt(discriminant), color.getRGB(),
                this);
    }

    @Override
    public double[] normal(double[] pos) { return Tools.unitVector(Tools.subtract(pos, this.pos)); }

}
