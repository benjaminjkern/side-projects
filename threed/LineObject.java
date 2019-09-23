package threed;

import java.awt.Color;
import java.awt.Graphics;

import kern.Tools;

public class LineObject extends Object3D {

	Color color;
	PointObject start, end;

	public LineObject(Color color, double[] startPos, double[] endPos) {
		super(startPos);
		this.color = color;
		start = new PointObject(color, startPos);
		end = new PointObject(color, endPos);
		add(start); add(end);
	}

	public LineObject(Color color, double[] pos, double[] dir, double length) {
		super(pos);
		this.color = color;
		start = new PointObject(color, pos);
		end = new PointObject(color, Tools.add(pos, Tools.mult(Tools.unitVector(dir), length)));
		add(start); add(end);
	}

	public double[] dirAndMag() {
		return Tools.subtract(end.pos, start.pos);
	}

	@Override
	public void wireFrameDraw(Graphics g, LineObject camera, double fov, double stageWidth, double stageHeight) {
		g.setColor(color);
		g.drawLine(start.getScreenPos(camera, fov, stageWidth, stageHeight)[0], start.getScreenPos(camera, fov, stageWidth, stageHeight)[1],
				end.getScreenPos(camera, fov, stageWidth, stageHeight)[0], end.getScreenPos(camera, fov, stageWidth, stageHeight)[1]);
	}

	public void setLength(double length) {
		end = new PointObject(color, Tools.add(start.pos, Tools.mult(Tools.unitVector(dirAndMag()), length)));
	}

	public void step() {
		translate(dirAndMag());
	}
}
