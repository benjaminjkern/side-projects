import java.awt.Color;
import java.awt.Graphics;

public class Bullet {
    public double x,y,speed,angle;
    public static final double RADIUS = 2.5;
    private static final double DEFAULT_SPEED = 10;
    public Bullet(Character character) {
        this.x = character.x;
        this.y = character.y;
        this.speed = DEFAULT_SPEED;
        this.angle = character.angle;
    }
    
    public Bullet(double x,double y,double speed,double angle) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.angle = angle;
    }
    
    public void draw(Graphics g) {
        g.setColor(Color.PINK);
        g.fillOval((int)(x-RADIUS),(int)(y-RADIUS),(int)(RADIUS*2),(int)(RADIUS*2));
        g.setColor(Color.BLACK);
        g.drawOval((int)(x-RADIUS),(int)(y-RADIUS),(int)(RADIUS*2),(int)(RADIUS*2));
    }
    
    public void moveBullet() {
        x += speed*Math.cos(angle*Math.PI/180);
        y += speed*Math.sin(angle*Math.PI/180);
    }
}
