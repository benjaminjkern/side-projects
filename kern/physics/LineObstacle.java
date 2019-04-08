package kern.physics;

import java.awt.Graphics;

import kern.Tools;

public class LineObstacle extends Obstacle {
    
    double length;

    public LineObstacle(double x, double y, double length, double angle) {
        super(x,y);
        this.length = length;
        this.angle = angle;
        mass = DEFAULT_EPSILON*DEFAULT_DENSITY*length;
    }
    
    public LineObstacle(double x, double y, double length, double angle, double mass) {
        super(x,y);
        this.length = length;
        this.angle = angle;
        this.mass = mass;
    }
    
    public PointObstacle[] getEndpoints() {
        double[][] uv = Tools.mult(unitVec(), length/2.);
        return new PointObstacle[] {new PointObstacle(x - uv[0][0], y - uv[0][1]), new PointObstacle(x + uv[0][0], y + uv[0][1])};
    }
    
    public double[][] unitVec() {
        return new double[][] {{Math.cos(Math.toRadians(angle)), Math.sin(Math.toRadians(angle))}, {Math.cos(Math.toRadians(angle+90)), Math.sin(Math.toRadians(angle+90))}};
    }
    
    public void draw(Graphics g) {
        double[][] uv = Tools.mult(unitVec(), length/2.);
        g.drawLine((int) (x - uv[0][0]), (int) (y - uv[0][1]), (int) (x + uv[0][0]), (int) (y + uv[0][1]));
    }
    
    public LineObstacle next() {
        return new LineObstacle(x+speed[0], y+speed[1], length, angle+angSpeed, mass);
    }
}
