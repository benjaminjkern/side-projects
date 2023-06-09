package kern.physics;

import java.awt.Color;
import java.awt.Graphics;

public class CircObstacle extends Obstacle {
    public double radius;
    
    public CircObstacle(double x, double y, double radius) {
        super(x,y);
        this.radius = radius;
        mass = DEFAULT_DENSITY*Math.PI*radius*radius;
    }
    
    public CircObstacle(double x, double y, double radius, double mass) {
        super(x,y);
        this.radius = radius;
        this.mass = mass;
    }
    
    public void draw(Graphics g) {
        g.setColor(Color.BLACK);
        g.drawOval((int) (x-radius), (int) (y-radius), (int) (2*radius), (int) (2*radius));
    }
    
    public CircObstacle next() {
        return new CircObstacle(x+speed[0], y+speed[1], radius, mass);
    }
}
