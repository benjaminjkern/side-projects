package kern.physics;

import java.awt.Graphics;

import kern.Tools;

public abstract class Obstacle {
    public double x, y, angle, angSpeed, mass;
    public double[] speed;
    
    protected static final double DEFAULT_EPSILON = 0.1;
    protected static final double DEFAULT_DENSITY = 1;

    public Obstacle(double x, double y) {
        this.x = x;
        this.y = y;
        speed = new double[] {0,0};
        angSpeed = 0;
    }
    
    public Obstacle(double x, double y, double speedX, double speedY, double angSpeed) {
        this.x = x;
        this.y = y;
        speed = new double[] {speedX, speedY};
        this.angSpeed = angSpeed;
    }
    
    public static boolean collide(Obstacle o1, Obstacle o2) {
        return closestDist(o1, o2) <= 0;
    }
    
    public static double closestDist(Obstacle o1, Obstacle o2) {
        double dist = Tools.magnitude(closestVector(o1, o2));
        if (o1 instanceof CircObstacle) dist -= ((CircObstacle) o1).radius;
        if (o2 instanceof CircObstacle) dist -= ((CircObstacle) o2).radius;
        return dist;
    }
    
    public static double[] closestVector(Obstacle o1, Obstacle o2) {
        if (o2 instanceof PolyObstacle) {
            double[][] distVectors = new double[((PolyObstacle) o2).lines.length][];
            for (int pl = 0; pl < distVectors.length; pl++) {
                distVectors[pl] = closestVector(o1, ((PolyObstacle) o2).lines[pl]);
            }
            
            int minPos = Tools.minPos(Tools.magnitude(distVectors));
            return distVectors[minPos];
        }
        
        if (o1 instanceof LineObstacle) {
            
            if (o2 instanceof PointObstacle || o2 instanceof CircObstacle) return Tools.mult(-1, closestVector(o2, o1));
            else if (o2 instanceof LineObstacle) {
                LineObstacle l1  = (LineObstacle) o1;
                LineObstacle l2  = (LineObstacle) o2;
                
                PointObstacle[] endpoints1 = l1.getEndpoints();
                PointObstacle[] endpoints2 = l2.getEndpoints();
                
                // test distance of each endpoint to the other line, and find the shortest one
                double[][] distVectors = new double[][] {closestVector(endpoints1[0], l2), closestVector(endpoints1[1], l2), closestVector(endpoints2[0], l1), closestVector(endpoints2[1], l1)};
                int minPos = Tools.minPos(Tools.magnitude(distVectors));
                
                // checks to see if its valid (If the lines cross each other)
                double isValid = Tools.dotProduct(distVectors[minPos], new double[] {o2.x - o1.x, o2.y - o1.y});
                // flips the isValid if it needs to check the other cross Product
                if (minPos > 1) isValid *= -1;
                
                // if they cross each other then it returns 0 (They cross, so the shortest distance between them is 0), if not then its all good!!
                return (isValid > 0) ? Tools.mult(Tools.transpose((minPos > 1?l2:l1).unitVec()), distVectors[minPos]) : new double[] {0,0};
            }
        } else if (o1 instanceof PolyObstacle && (o2 instanceof PointObstacle || o2 instanceof CircObstacle || o2 instanceof LineObstacle)) return Tools.mult(-1, closestVector(o2, o1));
        
        if (o2 instanceof LineObstacle) {
            LineObstacle l = (LineObstacle) o2;
            
            double[] pos = Tools.mult(l.unitVec(), new double[] {o1.x - o2.x, o1.y - o2.y});
            
            double[] newPos = new double[] {(Math.abs(pos[0]) <= l.length/2.) ? 0 : (pos[0] - Tools.sgn(pos[0])*l.length/2.), pos[1]};
            
            return Tools.mult(Tools.transpose(l.unitVec()), newPos);
        }
        
        //if theyre both 
        return new double[] {o2.x-o1.x, o2.y-o1.y};
    }
    
    //movable object colliding with a non-movable object (easy)
    // bounce:
    //   0: go through
    //   1: stop motion in that direction
    //   2: full bounce off
    public double[] hitTest(Obstacle o, double bounce) {
        //while loop is dangerous
        while (collide(this,o.next())) {
            double[] cv = Tools.mult(bounce*closestDist(this, o.next()), Tools.unitVector(closestVector(this, o.next())));
            return Tools.add(o.speed, cv);
        }
        return o.speed;
    }

    //movable object colliding with a movable object (more difficult)
    public static void bounce(Obstacle o1, Obstacle o2, double bounce) {
        if (collide(o1.next(),o2.next())) {
            //TODO: DO this
        }
    }
    
    public void move() {
        x += speed[0];
        y += speed[1];
        angle += angSpeed;
    }

    abstract void draw(Graphics g);
    abstract Obstacle next();
}