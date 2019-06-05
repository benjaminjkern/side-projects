package neuralnets.fightinggame;

import java.awt.Color;
import java.awt.Graphics;

import kern.physics.CircObstacle;

public class Bullet extends CircObstacle {
    private static final double DEFAULT_SPEED = 10;
    
    public static final double RADIUS = 2.5;
    
    public Bullet(Character character) {
        super(character.x, character.y, RADIUS);
        this.speed = new double[] {DEFAULT_SPEED*Math.cos(Math.toRadians(character.angle)), DEFAULT_SPEED*Math.sin(Math.toRadians(character.angle))};
    }
    
    public Bullet(double x,double y,double speed,double angle) {
        super(x, y, RADIUS);
        this.speed = new double[] {DEFAULT_SPEED*Math.cos(Math.toRadians(angle)), DEFAULT_SPEED*Math.sin(Math.toRadians(angle))};
        
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
}
