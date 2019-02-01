package neuralnets;

import kern.Game;
import java.awt.Graphics;
import java.awt.event.KeyEvent;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.JRootPane;

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

    public static final int NUM = 120;
    private static final int MAXTIME = 60*15;

    private boolean animate = true;

    public AIFightingGame(int width, int height) {
        super(width, height);
        
        population = new Population(NUM);
        stats = new Stats(population);
        gui = new GUI(width, height);
        
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
        gui.l.b.display(population);
        
        initCharacters();
    }

    private void initCharacters() {
        if (id1<population.size() && id2<population.size()) {
            time = MAXTIME;
            
            character1 = new Character(1, population.get(id1));
            character2 = new Character(2, population.get(id2));
            
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
            character1.member().changeScore(-100);
        }
        if (character2.isHit()) {
            character1.member().changeScore(1);
            character2.member().changeScore(-100);
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
}
