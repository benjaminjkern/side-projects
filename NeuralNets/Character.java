package neuralnets;

import java.awt.Color;
import java.awt.Graphics;
import java.util.ArrayList;
import kern.Tools;

public class Character {
    private double x,y,speed,angle,FOV,memory,waitTime = 0;
    private boolean shield;
    
    public double x() {return x;}
    public double y() {return y;}
    public double angle() {return angle;}

    private ArrayList<Bullet> bullets;

    private static final int FOVDIST = 150;
    private static final double MINFOV = 1;
    private static final double MAXFOV = 90;
    
    private static final double FOVSPEED = 0.5;
    private static final double MAXSPEED = 3;
    private static final double ANGSPEED = 2;
    
    private static final int TIMEBETWEENSHOTS = 60;
    
    public static final double RADIUS = 25;

    private Member myMember;
    private Character opponent;

    public Character(int whichSide, Member m) {
        if (whichSide == 1) {
            x = AIFightingGame.width/4.;
            y = AIFightingGame.height/2.-GUI.LowerStage.HEIGHT/2.;
            angle = 180;
        } else {
            x = AIFightingGame.width*3/4.;
            y = AIFightingGame.height/2.-GUI.LowerStage.HEIGHT/2.;
            angle = 0;
        }
        
        this.speed = 0;
        this.FOV = 45;
        this.bullets = new ArrayList<>();
        myMember = m;
    }
    
    public void setOpponent(Character o) {
        opponent = o;
    }

    public void draw(Graphics g) {

        //draw bullets
        for (int b=0;b<bullets.size();b++) {
            bullets.get(b).draw(g);
        }

        //draw shield!
        if (shield) {
            g.setColor(new Color(255, 0, 0, 50));
            g.fillArc((int) (x - FOVDIST), (int) (y - FOVDIST), 2*FOVDIST, 2*FOVDIST, (int)(-FOV/2.-angle), (int)(FOV));
        }

        //FOV lines
        g.setColor(Color.BLACK);
        g.drawLine((int) x, (int)y, (int)(x+150*Math.cos((angle-FOV/2)/180*Math.PI)),(int)(y+FOVDIST*Math.sin((angle-FOV/2)/180*Math.PI)));
        g.drawLine((int) x, (int)y, (int)(x+150*Math.cos((angle+FOV/2)/180*Math.PI)),(int)(y+FOVDIST*Math.sin((angle+FOV/2)/180*Math.PI)));

        //draw ball
        g.setColor(myMember.color);
        g.fillOval((int)(x - RADIUS), (int)(y - RADIUS), (int)(2 * RADIUS), (int)(2 * RADIUS));
        g.setColor(Color.BLACK);
        g.drawOval((int)(x - RADIUS), (int)(y - RADIUS), (int)(2 * RADIUS), (int)(2 * RADIUS));
    }

    public void moveCharacter() {
        handleOutputs();

        //handle speed and wall collisions
        double speedX = speed*Math.cos(angle*Math.PI/180);
        double speedY = speed*Math.sin(angle*Math.PI/180);

        if (x+speedX<RADIUS) {
            speedX = 0;
            x = RADIUS;
        }
        if (x+speedX>AIFightingGame.width-RADIUS) {
            speedX = 0;
            x = AIFightingGame.width-RADIUS;
        }
        if (y+speedY<RADIUS) {
            speedY = 0;
            y = RADIUS;
        }
        if (y+speedY>AIFightingGame.height-GUI.LowerStage.HEIGHT-RADIUS) {
            speedY = 0;
            y = AIFightingGame.height-GUI.LowerStage.HEIGHT-RADIUS;
        }

        //check if hitting center divider
        if (x>AIFightingGame.width/2 && x+speedX<AIFightingGame.width/2.+RADIUS) {
            speedX = 0;
            x = AIFightingGame.width/2.+RADIUS;
        }
        if (x<AIFightingGame.width/2 && x+speedX>AIFightingGame.width/2.-RADIUS) {
            speedX = 0;
            x = AIFightingGame.width/2.-RADIUS;
        }

        if (!shield) {
            x += speedX;
            y += speedY;
        }

        //handle bullet waiting time
        waitTime--;
        for (int b=bullets.size()-1; b>=0; b--) {
            Bullet bull = bullets.get(b);
            bull.moveBullet();
            
            // Just in case I want the bullets to be destroyed by the shield: if (bull.outOfFrame() || (getDist(bull)<FOVDIST && checkInSight(bull) && shield)) {
            if (bull.outOfFrame()) {
                bullets.remove(b);
            }
        }
    }
    
    private void handleOutputs() {
        //get outputs
        double[] outputs = Tools.sigmoid(myMember.brain.propagate(getInputs()));
        
        /*
         * outputs[0]: Speed
         * outputs[1]: Turn
         * outputs[2]: Angle of FOV
         * outputs[3]: Shield!
         * outputs[4]: Shoot!
         * outputs[5]: Keep a memory
         */

        //put them to work!
        speed = (outputs[0]*2-1)*MAXSPEED;
        angle += (outputs[1]*2-1)*ANGSPEED;
        FOV += (outputs[2]*2-1)*FOVSPEED;
        shield = outputs[3]>0.5;
        if (outputs[4]>0.5 && !shield) shoot();
        memory = outputs[5];

        //handle maxs and angle fixing
        if (FOV>MAXFOV) {
            FOV = MAXFOV;
        }
        if (FOV<MINFOV) {
            FOV = MINFOV;
        }

        while (angle>180) {
            angle -= 360;
        }
        while (angle<=-180) {
            angle += 360;
        }
    }

    private double[] getInputs() {
        double[] inputs = new double[myMember.brain.inputs()];
        
        /*
         * inputs[0]: Distance from opponent, put through a sigmoid (-1 if not in sight)
         * inputs[1]: Distance from bullet, again put through a sigmoid (closest opponent bullet, -1 if none in sight)
         * inputs[2]: whether the opponent has their shield on
         * inputs[3]: whether I am in the opponent's sight (1 if you guys are in each other's sight, 0 if you can see them but they cannot see you, -1 if you cannot see them)
         * inputs[4]: memory
         */
        
        Bullet oBullet = findBullet();
        boolean opponentInSight = checkInSight(opponent);

        inputs[0] = opponentInSight?1:-1;
        if (opponentInSight) {
            inputs[1] = getDist(opponent) / (double) AIFightingGame.width * 2 - 1;
            inputs[2] = Tools.dotProduct(Tools.unitVector(getDiff(opponent)), opponent.unitVecDir());
            inputs[3] = opponent.shield?1:-1;
        }
        inputs[4] = (oBullet != null)?1:-1;
        if (oBullet != null) {
            inputs[5] = getDist(oBullet) / (double) AIFightingGame.width * 2 - 1;
            inputs[6] = Tools.dotProduct(Tools.unitVector(getDiff(oBullet)), oBullet.unitVecDir());
        }
        inputs[7] = shield?1:-1;
        inputs[8] = FOV/45 - 1;
        inputs[9] = memory;
        inputs[10] = Tools.rand(-1,1);

        return inputs;
    }
    
    public double[] unitVecDir() {
        return new double[] {Math.cos(Math.toRadians(angle)), Math.sin(Math.toRadians(angle))};
    }

    private Bullet findBullet() {
        double dist = Integer.MAX_VALUE;
        Bullet oBullet = null;
        
        for (Bullet b:opponent.bullets) {
            if (checkInSight(b) && getDist(b)<dist) {
                dist = getDist(b);
                oBullet = b;
            }
        }
        return oBullet;
    }

    //I dont wanna use this anymore
    public double getDir(double x, double y, double angle, double speed) {
        double diffX = x - this.x;
        double diffY = y - this.y;
        double diff = Math.sqrt(diffX * diffX + diffY * diffY);
        double dx = Math.cos(angle * Math.PI / 180);
        double dy = Math.sin(angle * Math.PI / 180);

        return diff == 0 ? 0 : ((diffX * dy - dx * diffY) / diff * Tools.sgn(speed));
    }

    public boolean checkInSight(double x, double y, double Fangle) {
        return angleInRange(Math.toDegrees(Math.atan2(y - this.y, x - this.x)), angle - Fangle, angle + Fangle);
    }
    
    public static boolean angleInRange(double testAngle, double beginRange, double endRange) {
        double editedB = (beginRange + 180) % 360 - 180;
        double editedE = (endRange + 180) % 360 - 180;
        double editedT = (testAngle + 180) % 360 - 180;
        
        if (editedE < editedB) editedE += 360;
        
        return editedB <= editedT && editedT <= editedE;
    }

    public boolean checkInSight(double x,double y) {
        return checkInSight(x,y,FOV/2.);
    }

    public boolean checkInSight(Character c) {
        return checkInSight(c.x(),c.y(),FOV/2. + Math.toDegrees(Math.asin(RADIUS / getDist(c))));
    }

    public boolean checkInSight(Bullet b) {
        return checkInSight(b.x(),b.y(),FOV/2. + Math.toDegrees(Math.asin(Bullet.RADIUS / getDist(b))));
    }
    
    public double[] getDiff(double x, double y) {
        return new double[] {x - this.x, y - this.y};
    }

    public double getDist(double x,double y) {
        return Math.sqrt(Tools.sum(Tools.cPow(getDiff(x,y), 2)));
    }
    
    public double[] getDiff(Bullet b) {
        return getDiff(b.x(), b.y());
    }
    public double[] getDiff(Character c) {
        return getDiff(c.x(), c.y());
    }
    
    public double getDist(Bullet b) {
        return getDist(b.x(), b.y());
    }
    public double getDist(Character c) {
        return getDist(c.x(), c.y());
    }

    public boolean isHit() {

        for (int b=0;b<opponent.bullets.size();b++) {
            Bullet theBullet = opponent.bullets.get(b);

            //bullet kills character
            if (getDist(theBullet)<RADIUS+Bullet.RADIUS) {
                opponent.bullets.remove(b);
                return true;
            }

            //shield destroys bullet
            if (getDist(theBullet)<FOVDIST && checkInSight(theBullet) && shield) {
                opponent.bullets.remove(b);
            }
        }
        return false;
    }

    public void shoot() {
        if (waitTime<=0) {
            Bullet newBullet = new Bullet(this);
            bullets.add(newBullet);
            waitTime = TIMEBETWEENSHOTS;
        }
    }

    public Member member() {
        return myMember;
    }
}
