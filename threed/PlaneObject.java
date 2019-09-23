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
		add(new LineObject(color, Tools.add(pos, Tools.add(Tools.mult(dir[0], width/2), Tools.mult(dir[1], height/2))), dir[0], -width));
		add(new LineObject(color, Tools.add(pos, Tools.add(Tools.mult(dir[0], width/2), Tools.mult(dir[1], height/2))), dir[1], -height));
		add(new LineObject(color, Tools.add(pos, Tools.add(Tools.mult(dir[0], -width/2), Tools.mult(dir[1], -height/2))), dir[0], width));
		add(new LineObject(color, Tools.add(pos, Tools.add(Tools.mult(dir[0], -width/2), Tools.mult(dir[1], -height/2))), dir[1], height));
	}

	@Override
	public ClosestColor getDist(double[] marcher, Object3D bounceOff) {
		double[] diff = Tools.subtract(marcher, pos);
		double x = Tools.dotProduct(diff, dir[0]);
		double y = Tools.dotProduct(diff, dir[1]);
		double[] dist = Tools.subtract(marcher, Tools.add(pos, Tools.add(Tools.mult(weirdSigmoid(x, width/2), dir[0]), Tools.mult(weirdSigmoid(y, height/2), dir[1]))));
		return new ClosestColor(Tools.magnitude(dist), color.getRGB(), this);
	}

	private static double weirdSigmoid(double x, double z) {
		return Math.min(Math.abs(x), z)*Tools.sgn(x);
	}

	@Override
	public double[] normal(double[] pos) {
		double[] n = Tools.crossProduct(dir[0], dir[1]);
		return Tools.mult(n, Tools.sgn(Tools.dotProduct(n, Tools.subtract(pos, this.pos))));
	}

	@Override
	public void rotate(double[][] R, double[] root) {
		dir = Tools.transpose(Tools.mult(R, Tools.transpose(dir)));
		super.rotate(R, root);
	}
}
