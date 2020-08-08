package kern.physics;

import java.awt.Graphics;

import kern.Tools;

public class PolyObstacle extends Obstacle {
    
    public LineObstacle[] lines;
    double[][] positions;
    double[] angles;

    public PolyObstacle(double x, double y, LineObstacle... lineObstacles) {
        super(x, y);
        mass = 0;
        angle = 0;
        positions = new double[lineObstacles.length][];
        angles = new double[lineObstacles.length];
        
        lines = new LineObstacle[lineObstacles.length];
        for (int l = 0;l<lineObstacles.length;l++) {
            lines[l] = lineObstacles[l];
            mass += lineObstacles[l].mass;
            positions[l] = new double[] {lineObstacles[l].x, lineObstacles[l].y};
            angles[l] = lineObstacles[l].angle;
        }
    }
    
    public PolyObstacle(double x, double y, double angle, double mass, LineObstacle... lineObstacles) {
        super(x, y);
        this.mass = mass;
        this.angle = angle;
        
        lines = new LineObstacle[lineObstacles.length];
        for (int l = 0;l<lineObstacles.length;l++) {
            lines[l] = lineObstacles[l];
            positions[l] = new double[] {lineObstacles[l].x, lineObstacles[l].y};
        }
    }
    
    public void draw(Graphics g) {
        for (LineObstacle l: lines) {
            l.draw(g);
        }
    }
    
    PolyObstacle next() {
        // THIS NEEDS TO BE FIXED
        return new PolyObstacle(x+speed[0], y+speed[1], angle+angSpeed, mass, lines);
    }
    
    @Override
    public void move() {
        super.move();
        for (int l = 0;l<lines.length;l++) {
            double[][] newPos = Tools.transpose(Tools.mult(Tools.rotateMat(Math.toRadians(angle)), Tools.transpose(positions)));
            
            lines[l].x = x+newPos[l][0];
            lines[l].y = y+newPos[l][1];
            lines[l].angle = angle+angles[l];
        }
    }

}
