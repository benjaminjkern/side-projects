package neuralnets;

import java.awt.Color;
import java.awt.Graphics;

public class Bullet {
    private double x,y,speed,angle;
    private static final double DEFAULT_SPEED = 10;
    
    public static final double RADIUS = 2.5;
    
    public Bullet(Character character) {
        this.x = character.x();
        this.y = character.y();
        this.speed = DEFAULT_SPEED;
        this.angle = character.angle();
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
    
    public double[] unitVecDir() {
        return new double[] {Math.cos(Math.toRadians(angle)), Math.sin(Math.toRadians(angle))};
    }
    
    public void moveBullet() {
        x += speed*Math.cos(angle*Math.PI/180);
        y += speed*Math.sin(angle*Math.PI/180);
    }
    
    public boolean outOfFrame() {
        return x>AIFightingGame.width || x<0 || y>AIFightingGame.height-GUI.LowerStage.HEIGHT || y<0;
    }

    public double x() {return x;}
    public double y() {return y;}
}
