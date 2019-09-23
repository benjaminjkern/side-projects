package threed;

import java.awt.Color;

import kern.Tools;

public class PointObject extends Object3D {

	Color color;

	public PointObject(Color color, double[] pos) {
		super(pos);
		this.color = color;
	}

	public int[] getScreenPos(LineObject camera, double FOV, double stageWidth, double stageHeight) {
		double[] x = Tools.unitVector(Tools.crossProduct(camera.dirAndMag(), new double[] {0,0,1}));
		double[] y = Tools.mult(-1, Tools.unitVector(Tools.crossProduct(x, camera.dirAndMag())));

		double[][] bases = Tools.concatenate(x,y);

		double radius = Math.sqrt(stageWidth*stageWidth + stageHeight*stageHeight)/2.;

		double[] diff = Tools.subtract(pos, camera.pos);

		double[] proj = Tools.unitVector(Tools.mult(bases, diff));

		double adjAng = Math.acos(Tools.dotProduct(diff, camera.dirAndMag())/Tools.magnitude(diff))/FOV;

		return new int[] {getScreenPos(stageWidth, radius, 0, adjAng, proj), getScreenPos(stageHeight, radius, 1, adjAng, proj)};
	}


	private static int getScreenPos(double stage, double radius, int xy, double adjAng, double[] vector) {
		return (int) (stage/2. + radius*vector[xy]*adjAng);
	}


}
