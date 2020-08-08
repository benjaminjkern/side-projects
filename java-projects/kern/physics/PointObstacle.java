package kern.physics;

import java.awt.Graphics;

public class PointObstacle extends CircObstacle {

    public PointObstacle(double x, double y) {
        super(x,y, Obstacle.DEFAULT_EPSILON);
        radius = 0;
    }
    
    public PointObstacle(double x, double y, double mass) {
        super(x,y, Obstacle.DEFAULT_EPSILON);
        radius = 0;
        this.mass = mass;
    }
    
    @Override
    public void draw(Graphics g) {
        g.drawOval((int) x, (int) y, 1, 1);
    }

    @Override
    public PointObstacle next() {
        return new PointObstacle(x+speed[0], y+speed[1], mass);
    }
}
