package kern.physics;

import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Rectangle;

import kern.Tools;

public class RectObstacle extends PolyObstacle {
    
    public double width, height, angle;

    public RectObstacle(double x, double y, double width, double height, double angle) {
        super(x,y);
        positions = new double[4][];
        angles = new double[4];
        
        lines = new LineObstacle[4];
        for (int l = 0;l<4;l++) {
            lines[l] = new LineObstacle(x+Tools.mult(unitVec()[l%2],(l<2?1:-1)*(l%2==0?width:height)/2.)[0], y+Tools.mult(unitVec()[l%2],(l<2?1:-1)*(l%2==0?width:height)/2.)[1], l%2==1?width:height, angle+(l+1)*90);
            positions[l] = new double[] {lines[l].x, lines[l].y};
            angles[l] = lines[l].angle;
        }
        
        this.width = width;
        this.height = height;
        this.angle = angle;
        mass = DEFAULT_DENSITY*width*height;
    }
    
    public RectObstacle(double x, double y, double width, double height, double angle, double mass) {
        super(x,y);
        
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.mass = mass;
    }
    
    public double[][] unitVec() {
        return new double[][] {{Math.cos(Math.toRadians(angle)), Math.sin(Math.toRadians(angle))}, {Math.cos(Math.toRadians(angle+90)), Math.sin(Math.toRadians(angle+90))}};
    }
    
    public boolean insideRect(Obstacle o) {
        double[] pos = Tools.mult(unitVec(), new double[] {x-o.x, y-o.y});
        return Math.abs(pos[0]) < width/2. && Math.abs(pos[1]) < height/2.;
    }
    
    @Override
    public RectObstacle next() {
        return new RectObstacle(x+speed[0], y+speed[1], width, height, angle+angSpeed, mass);
    }
    
    public void draw(Graphics g, Color c) {
        Graphics2D g2 = (Graphics2D) g;
        g2.setColor(c);
        Rectangle rect2 = new Rectangle((int)(x-width/2.),(int)(y-height/2.),(int)(width/8.),(int)(height/8.));

        g2.rotate(Math.toRadians(angle));
        g2.draw(rect2);
        g2.fill(rect2);
    }
}
