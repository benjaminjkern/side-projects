package threed;

import java.awt.Color;

import kern.Tools;

public class PlaneObject extends Object3D {

    Color color;
    double[][] dir;
    double width, height;

    public PlaneObject(Color color, double[] pos, double[][] dir, double width, double height) {
        this.pos = pos;
        this.color = color;
        this.dir = dir;
        this.width = width;
        this.height = height;
        add(new LineObject(color,
                Tools.add(pos, Tools.add(Tools.mult(dir[0], width / 2), Tools.mult(dir[1], height / 2))), dir[0],
                -width));
        add(new LineObject(color,
                Tools.add(pos, Tools.add(Tools.mult(dir[0], width / 2), Tools.mult(dir[1], height / 2))), dir[1],
                -height));
        add(new LineObject(color,
                Tools.add(pos, Tools.add(Tools.mult(dir[0], -width / 2), Tools.mult(dir[1], -height / 2))), dir[0],
                width));
        add(new LineObject(color,
                Tools.add(pos, Tools.add(Tools.mult(dir[0], -width / 2), Tools.mult(dir[1], -height / 2))), dir[1],
                height));
    }

    @Override
    public ClosestColor getDist(LineObject marcher, Object3D bounceOff) {
        double[] diff = Tools.subtract(pos, marcher.pos);
        double[] n = normal(marcher.pos);
        double t = Tools.dotProduct(diff, n) / Tools.dotProduct(marcher.unitDir(), n);
        double[] hitPoint = Tools.mult(dir, Tools.add(marcher.pos, (Tools.mult(t, marcher.unitDir()))));
        // if its never gonna hit it dont return anything ya bish
        if (t < 0 || decideIfIn(hitPoint)) return new ClosestColor(Double.MAX_VALUE, 0, this);
        return new ClosestColor(t * 0.999, color.getRGB(), this);
        // I REALLY SHOULD HAVE IT DO SOMETHING DIFFERENT THAN THIS BUT ITS OKAY FOR NOW
    }

    public boolean decideIfIn(double[] hitPoint) {
        return Math.abs(hitPoint[0]) > width / 2. || Math.abs(hitPoint[1]) > height / 2.;
    }

    @Override
    public double[] normal(double[] pos) {
        return Tools.unitVector(Tools.crossProduct(dir[0], dir[1]));
    }

    @Override
    public void rotate(double[][] R, double[] root) {
        dir = Tools.transpose(Tools.mult(R, Tools.transpose(dir)));
        super.rotate(R, root);
    }
}
