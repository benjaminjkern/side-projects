import java.awt.Color;
import java.awt.Graphics;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.util.ArrayList;

import javax.swing.JButton;

public class Character {
    public double x,y,speed,angle,FOV,waitTime = 0;
    public int name;
    public Color color;

    NeuralNet brain;
    public ArrayList<Bullet> bullets;

    public static final double RADIUS = 25;
    private static final double MAXSPEED = 3;
    private static final double ANGSPEED = 2;
    private static final double FOVSPEED = 0.5;
    private static final int TIMEBETWEENSHOTS = 60;

    double[] outputs;

    int id;

    public Character(int whichSide, Population.Member m) {
        switch (whichSide) {
            case 1:
                this.x = GUI.width/4;
                this.y = GUI.height/2-GUI.LowerStage.HEIGHT/2;
                this.angle = 180;
                break;
            case 2:
                this.x = GUI.width*3/4;
                this.y = GUI.height/2-GUI.LowerStage.HEIGHT/2;
                this.angle = 0;
                break;
        }
        id = whichSide;
        this.speed = 0;
        this.FOV = 45;
        this.bullets = new ArrayList<Bullet>();

        this.brain = m.brain;
        this.name = m.name;
        this.color = m.color;
        outputs = new double[brain.outputCount];
    }

    public void draw(Graphics g) {
        for (int b=0;b<bullets.size();b++) {
            bullets.get(b).draw(g);
        }

        g.setColor(Color.BLACK);
        g.drawLine((int) x, (int)y, (int)(x+150*Math.cos((angle-FOV/2)/180*Math.PI)),(int)(y+150*Math.sin((angle-FOV/2)/180*Math.PI)));
        g.drawLine((int) x, (int)y, (int)(x+150*Math.cos((angle+FOV/2)/180*Math.PI)),(int)(y+150*Math.sin((angle+FOV/2)/180*Math.PI)));


        g.setColor(color);
        g.fillOval((int)(x - RADIUS), (int)(y - RADIUS), (int)(2 * RADIUS), (int)(2 * RADIUS));

        g.setColor(Color.BLACK);
        g.drawOval((int)(x - RADIUS), (int)(y - RADIUS), (int)(2 * RADIUS), (int)(2 * RADIUS));
    }

    public void moveCharacter() {
        /*
         * outputs[0]: Speed
         * outputs[1]: Turn
         * outputs[2]: Angle of FOV
         * outputs[3]: Shoot!
         */

        outputs = brain.propogate(getInputs());

        speed = (outputs[0]*2-1)*MAXSPEED;
        //System.out.println(speed+" Came from "+outputs[0]);
        angle += (outputs[1]*2-1)*ANGSPEED;
        FOV += (outputs[1]*2-1)*FOVSPEED;
        if (outputs[3]>0.5) shoot();

        if (FOV>90) {
            FOV = 90;
        }
        if (FOV<5) {
            FOV = 5;
        }

        while (angle>180) {
            angle -= 360;
        }

        while (angle<=-180) {
            angle += 360;
        }

        double speedX = speed*Math.cos(angle*Math.PI/180);
        double speedY = speed*Math.sin(angle*Math.PI/180);



        if (x+speedX<RADIUS) {
            speedX = 0;
            x = RADIUS;
        }
        if (x+speedX>GUI.width-RADIUS) {
            speedX = 0;
            x = GUI.width-RADIUS;
        }
        if (y+speedY<RADIUS) {
            speedY = 0;
            y = RADIUS;
        }
        if (y+speedY>GUI.height-GUI.LowerStage.HEIGHT-RADIUS) {
            speedY = 0;
            y = GUI.height-GUI.LowerStage.HEIGHT-RADIUS;
        }

        if (x>GUI.width/2 && x+speedX<GUI.width/2+RADIUS) {
            speedX = 0;
            x = GUI.width/2+RADIUS;
        }
        if (x<GUI.width/2 && x+speedX>GUI.width/2-RADIUS) {
            speedX = 0;
            x = GUI.width/2-RADIUS;
        }

        x += speedX;
        y += speedY;

        waitTime--;
        for (int b=0;b<bullets.size();b++) {
            bullets.get(b).moveBullet();
            if (bullets.get(b).x>GUI.width || bullets.get(b).x<0 || bullets.get(b).y>GUI.height-GUI.LowerStage.HEIGHT || bullets.get(b).y<0) {
                bullets.remove(b);
                b--;
            }
        }
    }

    public double[] getInputs() {
        /*
         * inputs[0]: Distance from opponent, put through a sigmoid (-1 if not in sight)
         * inputs[1]: Distance from bullet, again put through a sigmoid (closest opponent bullet, -1 if none in sight)
         */
        double[] inputs = new double[brain.inputCount];
        Character opponent = AIFightingGame.getOpponent(this);
        Bullet oBullet = findBullet();
        boolean opponentInSight = checkInSight(opponent.x,opponent.y);


        inputs[0] = opponentInSight?(NeuralNet.sigmoid(getDist(opponent.x,opponent.y)/(double)GUI.width)*2-1):-1;
        inputs[1] = (oBullet!=null)?(NeuralNet.sigmoid(getDist(oBullet.x,oBullet.y)/(double)GUI.width)*2-1):-1;
        inputs[2] = opponentInSight?getDir(opponent.x,opponent.y,opponent.angle,opponent.speed):0;
        inputs[3] = (oBullet!=null)?getDir(oBullet.x,oBullet.y,oBullet.angle,oBullet.speed):0;

        //System.out.println(NeuralNet.printArray(inputs));

        return inputs;
    }

    public boolean equals(Character other) {
        return name == other.name;
    }

    public Bullet findBullet() {
        double dist = Integer.MAX_VALUE;
        Bullet oBullet = null;
        for (Bullet b:AIFightingGame.getOpponent(this).bullets) {
            if (checkInSight(b.x,b.y) && getDist(b.x,b.y)<dist) {
                dist = getDist(b.x,b.y);
                oBullet = b;
            }
        }
        return oBullet;
    }

    public double getDir(double x, double y, double angle, double speed) {
        double diffX = x-this.x;
        double diffY = y-this.y;
        double diff = Math.sqrt(diffX*diffX+diffY*diffY);
        double dx = Math.cos(angle*Math.PI/180);
        double dy = Math.sin(angle*Math.PI/180);

        return diff==0?0:((diffX*dy-dx*diffY)/diff*(speed==0?1:speed/Math.abs(speed)));
    }

    public boolean checkInSight(double x,double y) {
        boolean stuff = Math.min(Math.abs(Math.atan2(y-this.y,x-this.x)/Math.PI*180-angle),Math.min(Math.abs(Math.atan2(y-this.y,x-this.x)/Math.PI*180-angle+360),Math.abs(Math.atan2(y-this.y,x-this.x)/Math.PI*180-angle-360)))<=FOV/2;
        return stuff;
    }

    public double getDist(double x,double y) {
        return Math.sqrt((x-this.x)*(x-this.x)+(y-this.y)*(y-this.y));
    }
    
    //----------------------------------------THIS LOOKS WEIRD

    public boolean isHit() {
        for (int b=0;b<AIFightingGame.getOpponent(this).bullets.size();b++) {
            Bullet theBullet = AIFightingGame.getOpponent(this).bullets.get(b);
            if (getDist(theBullet.x,theBullet.y)<RADIUS+Bullet.RADIUS) {
                AIFightingGame.getOpponent(this).bullets.remove(b);
                return true;
            }
        }
        return false;
    }

    public void shoot() {
        if (waitTime<=0) {
            Bullet newBullet = new Bullet(this);
            bullets.add(newBullet);
            //System.out.println("SHOOT");
            waitTime = TIMEBETWEENSHOTS;
        }
    }

    public void die() {
        if (id==1) {
            AIFightingGame.population.get(AIFightingGame.id1).takeSome();
        } else {
            AIFightingGame.population.get(AIFightingGame.id2).takeSome();
        }
    }
}
