package threed;

import java.awt.Color;

import kern.Keyframe;
import kern.Tools;

public class ThreeDFrame extends Keyframe {

	Demo3D wrapper;

	ThreeDFrame (int width, int height, Demo3D wrapper, ThreeDFrame parent) {
		super(width, height, parent);
		this.wrapper = wrapper;

		for (int y = 0; y<height;y++) {
			for (int x = 0;x<width;x++) {
				grid[y][x] =  wrapper.game.rayMarchDraw(0xffffff, 100, wrapper.light, inputRay(wrapper.camera, wrapper.fov, x, y, width, height), null, 100, 0.001, 1000);
			}
		}
	}

	private LineObject inputRay(LineObject camera, double fov, int x, int y, int width, int height) {
		double angleX = (x-width/2.)*2*fov/width;
		double angleY = (height/2.-y)*2*fov/height;
		double[] xVec = Tools.unitVector(Tools.crossProduct(camera.dirAndMag(), new double[] {0, 0, 1}));
		double[] yVec = Tools.unitVector(Tools.crossProduct(xVec, camera.dirAndMag()));
		return new LineObject(Color.RED, camera.pos, Tools.add(Tools.add(camera.dirAndMag(), Tools.mult(xVec, angleX)), Tools.mult(yVec, angleY)), 1);
	}

	public ThreeDFrame nextFrame() {
		wrapper.update();
		if (next == null) next = new ThreeDFrame(width, height, wrapper, this);
		return (ThreeDFrame) next;
	}
}
