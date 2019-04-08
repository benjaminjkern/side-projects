package neuralnets;

import java.awt.Graphics;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;

import javax.swing.JFrame;
import kern.Game;
import kern.physics.RectObstacle;

public class AIFightingGame extends Game {

    private static final long serialVersionUID = 1L;

    public static void main(String[] args) {
        // Run UI in the Event Dispatcher Thread (EDT), instead of Main thread
        javax.swing.SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("YEUH");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            AIFightingGame game = new AIFightingGame(1280,640);
            frame.setContentPane(game);
            frame.pack();
            frame.setVisible(true);
        });
    }

    private Population population;
    private Stats stats;

    private Character character1, character2;
    private int id1,id2;
    private int time;
    private int generation;

    private GUI gui;

    public static final int NUM = 2;
    private static final int MAXTIME = 60*15;

    private boolean animate = true;

    public AIFightingGame(int width, int height) {
        super(width, height);

        population = new Population(NUM);
        gui = new GUI(width, height);
        stats = new Stats(population, width, height-gui.lowerStage.height-gui.colorBar.height);

        newGeneration();
        gameStart();
    }

    private void newGeneration() {
        if (generation > 0) {
            population.resetScores();
            population.killAndRepopulate();
        }

        stats.storePop(population);
        population.scramble();

        generation++;

        id1 = 0;
        id2 = 1;

        Member oldest = population.getOldest();
        Member highestScore = population.getHighestTotal();
        Member highestAverage = population.getHighestAverage();

        gui.gen.display("Oldest: "+oldest.name+", Age: " + oldest.age, "Highest Total Score: " + highestScore.name + ", Total Score: " + highestScore.totalScore, "Highest Average Score: " + highestAverage.name+", Average Score: " + highestAverage.averageScore);
        gui.colorBar.display(population);

        initCharacters();
    }

    private void initCharacters() {
        if (id1<population.size() && id2<population.size()) {
            time = MAXTIME;
            
            double newHeight = height - gui.lowerStage.height - gui.colorBar.height;
            RectObstacle stage = new RectObstacle(width/2., newHeight/2., width, newHeight, 0);
            RectObstacle border1 = new RectObstacle(width*3/4., newHeight/2., width/2., newHeight, 0);
            RectObstacle border2 = new RectObstacle(width/4., newHeight/2., width/2., newHeight, 0);

            character1 = new Character(population.get(id1), 180, stage, border1);
            character2 = new Character(population.get(id2), 0, stage, border2);

            character1.setOpponent(character2);
            character2.setOpponent(character1);

            gui.c1.display(character1.member().infoText());
            gui.c2.display(character2.member().infoText());

            int matchNum = id1 / 2 + 1;
            int totalMatches = population.size() / 2;
            gui.game.display("Generation: "+generation, "Match: " + matchNum + "/" + totalMatches);
        } else {
            newGeneration();
        }
    }

    private void doCharacterStuff() {
        character1.moveCharacter();
        character2.moveCharacter();

        if (character1.isHit()) {
            character2.member().changeScore(1);
            character1.member().changeScore(-10);
        }
        if (character2.isHit()) {
            character1.member().changeScore(1);
            character2.member().changeScore(-10);
        }
    }

    public void endGame() {
        id1+=2;
        id2+=2;
        initCharacters();
    }

    @Override
    public void gameUpdate() {
        doCharacterStuff();

        time--;
        gui.time.display(time);

        if (time<=0) {
            endGame();
        }
    }

    @Override
    public void draw(Graphics g) {
        gui.draw(g);
        character1.draw(g);
        character2.draw(g);
        if (!animate) {
            stats.draw(g);
        }
    }

    @Override
    public void keyPressed(KeyEvent e) {
        int code = e.getKeyCode();
        switch (code) {
            case KeyEvent.VK_P:
                //pause
                paused = !paused;
                break;
            case KeyEvent.VK_SPACE:
                //toggle speed
                step = MAXSTEP+1-step;
                break;
            case KeyEvent.VK_A:
                //I should change this but this toggles stats screen
                animate = !animate;
                break;
            case KeyEvent.VK_S:
                //changes stats mode
                if (!animate) stats.nextMode();
                break;
            case KeyEvent.VK_W:
                //changes stats mode
                if (!animate) stats.prevMode();
                break;
            default:
                //literally just here so that the linter likes me
        }
    }

    @Override
    public void mouseClicked(MouseEvent e) {
        // TODO Auto-generated method stub

    }

    @Override
    public void mousePressed(MouseEvent e) {
        // TODO Auto-generated method stub

    }

    @Override
    public void mouseReleased(MouseEvent e) {
        // TODO Auto-generated method stub

    }

    @Override
    public void mouseEntered(MouseEvent e) {
        // TODO Auto-generated method stub

    }

    @Override
    public void mouseExited(MouseEvent e) {
        // TODO Auto-generated method stub

    }

    @Override
    public void keyTyped(KeyEvent e) {
        // TODO Auto-generated method stub

    }

    @Override
    public void keyReleased(KeyEvent e) {
        // TODO Auto-generated method stub

    }
}
