package threed;

import java.awt.Color;
import java.awt.Graphics;

import kern.Tools;

public class LineObject extends Object3D {

    Color color;
    double[] dirAndMag;
    
    public LineObject(Color color, double[] startPos, double[] endPos) {
        super(startPos);
        this.color = color;
        dirAndMag = Tools.subtract(endPos, startPos);
    }
    
    public LineObject(Color color, double[] pos, double[] dir, double length) {
        super(pos);
        this.color = color;
        dirAndMag = Tools.mult(Tools.unitVector(dir), length);
    }
    
    public double[] getEndPoint() {
        return Tools.add(pos, dirAndMag);
    }
    
    @Override
    public void draw(Graphics g, LineObject camera, double FOV, double stageWidth, double stageHeight) {
        
        double[] x = Tools.unitVector(Tools.crossProduct(camera.dirAndMag, new double[] {0,0,1}));
        double[] y = Tools.mult(-1, Tools.unitVector(Tools.crossProduct(x, camera.dirAndMag)));
        
        double radius = Math.sqrt(stageWidth*stageWidth + stageHeight*stageHeight)/2.;
        
        double[][] bases = Tools.concatenate(x,y);
        
        double[] startDiff = Tools.subtract(pos, camera.pos);
        double[] endDiff = Tools.subtract(getEndPoint(), camera.pos);
        
        double[] startProj = Tools.unitVector(Tools.mult(bases, startDiff));
        double[] endProj = Tools.unitVector(Tools.mult(bases, endDiff));
        
        double startAdjAng = Math.acos(Tools.dotProduct(startDiff, camera.dirAndMag)/Tools.magnitude(startDiff))/FOV;
        double endAdjAng = Math.acos(Tools.dotProduct(endDiff, camera.dirAndMag)/Tools.magnitude(endDiff))/FOV;
        
        
        if (startAdjAng <= 1 || endAdjAng <= 1) {
            g.setColor(color);
            g.drawLine(getScreenPos(stageWidth, radius, 0, startAdjAng, startProj), getScreenPos(stageHeight, radius, 1, startAdjAng, startProj),
                getScreenPos(stageWidth, radius, 0, endAdjAng, endProj), getScreenPos(stageHeight, radius, 1, endAdjAng, endProj));
        }
    }
    
    private int getScreenPos(double stage, double radius, int xy, double adjAng, double[] vector) {
        return (int) (stage/2. + radius*vector[xy]*adjAng);
    }

    public void rotate(double[][] R, double[] root) {
        double[][] points = Tools.transpose(Tools.concatenate(Tools.subtract(pos, root), Tools.subtract(getEndPoint(), root)));
        points = Tools.transpose(Tools.mult(R, points));
        pos = Tools.add(points[0], root);
        dirAndMag = Tools.subtract(Tools.add(points[1], root), pos);
    }
}
