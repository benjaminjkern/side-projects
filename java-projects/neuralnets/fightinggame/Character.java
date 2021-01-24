package neuralnets.fightinggame;

import java.awt.Color;
import java.awt.Graphics;
import java.util.ArrayList;

import kern.Tools;
import kern.physics.CircObstacle;
import kern.physics.RectObstacle;
import neuralnets.Member;

public class Character extends CircObstacle {
    private double FOV, memory, waitTime = 0;
    private ArrayList<Bullet> bullets;

    public static final int INPUTS = 10;
    public static final int OUTPUTS = 6;

    private static final int FOVDIST = 150;
    private static final double MINFOV = 2;
    private static final double MAXFOV = 90;

    private static final double FOVSPEED = 0.5;
    private static final double MAXSPEED = 3;
    private static final double ANGSPEED = 2;

    private static final int TIMEBETWEENSHOTS = 60;
    private static final double CHARACTER_RADIUS = 25;

    public Member myMember;
    private Character opponent;
    private RectObstacle stage, border;

    public Character(Member m, double angle, RectObstacle stage, RectObstacle border) {
        super(border.x, border.y, CHARACTER_RADIUS);

        this.stage = stage;
        this.border = border;
        this.angle = angle;
        this.FOV = 45;

        this.bullets = new ArrayList<>();
        myMember = m;
        myMember.games++;
    }

    public void setOpponent(Character o) { opponent = o; }

    @Override
    public void draw(Graphics g) {
        // draw bullets
        for (int b = 0; b < bullets.size(); b++) { bullets.get(b).draw(g); }

        // FOV lines
        g.setColor(Color.BLACK);
        g.drawLine((int) x, (int) y, (int) (x + 150 * Math.cos((angle - FOV / 2) / 180 * Math.PI)),
                (int) (y + FOVDIST * Math.sin((angle - FOV / 2) / 180 * Math.PI)));
        g.drawLine((int) x, (int) y, (int) (x + 150 * Math.cos((angle + FOV / 2) / 180 * Math.PI)),
                (int) (y + FOVDIST * Math.sin((angle + FOV / 2) / 180 * Math.PI)));

        // draw ball
        g.setColor(myMember.color);
        g.fillOval((int) (x - radius), (int) (y - radius), (int) (2 * radius), (int) (2 * radius));
        super.draw(g);
    }

    public void moveCharacter() {

        // this is how I want everything to be handled moving forward, I like it this
        // way
        handleOutputs(getInputs(stage));

        // test if colliding with other stuff

        speed = border.hitTest(this, 1);

        // after the collision is handled, move!
        move();

        // handle bullet waiting time
        waitTime--;
        for (int b = bullets.size() - 1; b >= 0; b--) {
            Bullet bull = bullets.get(b);
            bull.move();

            if (!stage.insideRect(bull)) { bullets.remove(b); }
        }
    }

    private void handleOutputs(double[] inputs) {
        // get outputs
        double[] outputs = Tools.sigmoid(myMember.brain.propagate(inputs));

        /*
         * outputs[0]: Speed outputs[1]: Turn outputs[2]: Angle of FOV outputs[3]:
         * Shield! outputs[4]: Shoot! outputs[5]: Keep a memory
         */

        // put them to work!
        speed = Tools.mult((outputs[0] * 2 - 1) * MAXSPEED, unitVecDir());
        angle += (outputs[1] * 2 - 1) * ANGSPEED;
        FOV += (outputs[2] * 2 - 1) * FOVSPEED;
        if (outputs[4] > 0.5) shoot();
        memory = outputs[5];

        // handle maxs and angle fixing
        if (FOV > MAXFOV) { FOV = MAXFOV; }
        if (FOV < MINFOV) { FOV = MINFOV; }

        while (angle > 180) { angle -= 360; }
        while (angle <= -180) { angle += 360; }
    }

    private double[] getInputs(RectObstacle stage) {
        double[] inputs = new double[myMember.brain.inputs()];

        /*
         * inputs[0]: Distance from opponent, put through a sigmoid (-1 if not in sight)
         * inputs[1]: Distance from bullet, again put through a sigmoid (closest
         * opponent bullet, -1 if none in sight) inputs[2]: whether the opponent has
         * their shield on inputs[3]: whether I am in the opponent's sight (1 if you
         * guys are in each other's sight, 0 if you can see them but they cannot see
         * you, -1 if you cannot see them) inputs[4]: memory
         */

        Bullet oBullet = findBullet();
        boolean opponentInSight = checkInSight(opponent);

        inputs[0] = opponentInSight ? 1 : -1;
        if (opponentInSight) {
            inputs[1] = getDist(opponent) / stage.width * 2 - 1;
            inputs[2] = Tools.dotProduct(Tools.unitVector(getDiff(opponent)), opponent.unitVecDir());
        }
        inputs[3] = (oBullet != null) ? 1 : -1;
        if (oBullet != null) {
            inputs[4] = getDist(oBullet) / stage.width * 2 - 1;
            inputs[5] = Tools.dotProduct(Tools.unitVector(getDiff(oBullet)), oBullet.unitVecDir());
        }
        inputs[6] = memory;
        inputs[7] = myMember.score;
        inputs[8] = opponent.myMember.score;
        inputs[9] = 1;

        // if (x > stage.width/2) Tools.println(inputs);

        return inputs;
    }

    public double[] unitVecDir() {
        return new double[] { Math.cos(Math.toRadians(angle)), Math.sin(Math.toRadians(angle)) };
    }

    private Bullet findBullet() {
        double dist = Integer.MAX_VALUE;
        Bullet oBullet = null;

        for (Bullet b : opponent.bullets) {
            if (checkInSight(b) && getDist(b) < dist) {
                dist = getDist(b);
                oBullet = b;
            }
        }
        return oBullet;
    }

    // I dont wanna use this anymore
    public double getDir(double x, double y, double angle, double speed) {
        double diffX = x - this.x;
        double diffY = y - this.y;
        double diff = Math.sqrt(diffX * diffX + diffY * diffY);
        double dx = Math.cos(angle * Math.PI / 180);
        double dy = Math.sin(angle * Math.PI / 180);

        return diff == 0 ? 0 : ((diffX * dy - dx * diffY) / diff * Tools.sgn(speed));
    }

    public static boolean angleInRange(double testAngle, double beginRange, double endRange) {
        double editedB = (beginRange + 180) % 360 - 180;
        double editedE = (endRange + 180) % 360 - 180;
        double editedT = (testAngle + 180) % 360 - 180;

        if (editedE < editedB) editedE += 360;

        return editedB <= editedT && editedT <= editedE;
    }

    public boolean checkInSight(double x, double y, double Fangle) {
        return angleInRange(Math.toDegrees(Math.atan2(y - this.y, x - this.x)), angle - Fangle, angle + Fangle);
    }

    public boolean checkInSight(double x, double y) { return checkInSight(x, y, FOV / 2.); }

    public boolean checkInSight(CircObstacle c) {
        return checkInSight(c.x, c.y, FOV / 2. + Math.toDegrees(Math.asin(c.radius / getDist(c))));
    }

    public double[] getDiff(CircObstacle c) { return new double[] { c.x - x, c.y - y }; }

    public double getDist(CircObstacle c) { return Math.sqrt(Tools.sum(Tools.cPow(getDiff(c), 2))); }

    public boolean isHit() {
        for (int b = 0; b < opponent.bullets.size(); b++) {
            Bullet theBullet = opponent.bullets.get(b);

            // bullet kills character
            if (collide(this, theBullet)) {
                opponent.bullets.remove(b);
                return true;
            }
        }
        return false;
    }

    public void shoot() {
        if (waitTime <= 0) {
            Bullet newBullet = new Bullet(this);
            bullets.add(newBullet);
            waitTime = TIMEBETWEENSHOTS;
        }
    }
}
