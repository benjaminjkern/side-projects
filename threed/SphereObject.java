package threed;

import java.awt.Color;

import kern.Tools;

public class SphereObject extends Object3D {

	public double radius;
	Color color;

	public SphereObject(Color color, double[] pos, double radius, int iMax, int jMax) {
		this.pos = pos;
		this.color = color;
		this.radius = radius;

		for (double i = 0; i < iMax; i++) {
			for (double j = 0; j < jMax; j++) {
				add(new LineObject(color, Tools.mult(radius, new double[] {Math.sin(i/iMax*Math.PI)*Math.cos(j/jMax*Math.PI*2), Math.sin(i/iMax*Math.PI)*Math.sin(j/jMax*Math.PI*2), Math.cos(i/iMax*Math.PI)}),
						Tools.mult(radius, new double[] {Math.sin((i+1)/iMax*Math.PI)*Math.cos(j/jMax*Math.PI*2), Math.sin((i+1)/iMax*Math.PI)*Math.sin(j/jMax*Math.PI*2), Math.cos((i+1)/iMax*Math.PI)})));
				add(new LineObject(color, Tools.mult(radius, new double[] {Math.sin(i/iMax*Math.PI)*Math.cos(j/jMax*Math.PI*2), Math.sin(i/iMax*Math.PI)*Math.sin(j/jMax*Math.PI*2), Math.cos(i/iMax*Math.PI)}),
						Tools.mult(radius, new double[] {Math.sin(i/iMax*Math.PI)*Math.cos((j+1)/jMax*Math.PI*2), Math.sin(i/iMax*Math.PI)*Math.sin((j+1)/jMax*Math.PI*2), Math.cos(i/iMax*Math.PI)})));
			}
		}
	}

	@Override
	public ClosestColor getDist(double[] marcher, Object3D bounceOff) {
		return new ClosestColor(Tools.magnitude(Tools.subtract(pos, marcher)) - radius, color.getRGB(), this);
	}

	@Override
	public double[] normal(double[] pos) {
		double[] diff = Tools.subtract(pos, this.pos);
		double dist = Tools.magnitude(diff);
		return Tools.mult(Tools.sgn(dist-radius), Tools.unitVector(diff));
	}
}
