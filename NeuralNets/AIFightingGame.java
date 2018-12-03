import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.util.ConcurrentModificationException;

import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;

public class AIFightingGame extends Game {
    
    public static void main(String[] args) {
        // Run UI in the Event Dispatcher Thread (EDT), instead of Main thread
        javax.swing.SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                JFrame frame = new JFrame("YEUH");
                frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
                AIFightingGame game = new AIFightingGame(1280,640);
                frame.setContentPane(game);
                frame.pack();
                frame.setVisible(true);
            }
        });
    }

    public static Population population;
    public static Population.Member oldest, highestScore, highestAverage;
    public static Stats stats;

    private static Character character1, character2;
    public static int id1,id2;
    public static int time;
    public static int generation;

    private GUI gui;
    
    public static final int NUM = 130;
    private static final int MAXTIME = 60*15;

    public static boolean debug = false;
    public static boolean animate = true;

    public AIFightingGame(int width, int height) {
        super(width, height);
        
        gui = new GUI(width,height);

        population = new Population(NUM);
        stats = new Stats();

        newGeneration();
        initCharacters();
        gameStart();
    }

    private void newGeneration() {
        stats.store(population);

        oldest = population.getOldest();
        highestAverage = population.getHighestAverage();
        highestScore = population.getHighestTotal();
        population.scramble();

        generation++;

        id1 = 0;
        id2 = 1;

        initCharacters();
    }

    private void initCharacters() {
        if (id1<population.size && id2<population.size) {
            time = MAXTIME;
            character1 = new Character(1, population.get(id1));
            character2 = new Character(2, population.get(id2));
        } else {
            population.killAndRepopulate();
            newGeneration();
        }
    }

    public void gameUpdate() {
        doCharacterStuff();
        
        time--;
        if (time<=0) {
            endGame(null);
        }
    }

    private void doCharacterStuff() {
        character1.moveCharacter();
        character2.moveCharacter();
        if (!Double.isFinite(character1.x) || !Double.isFinite(character2.x)) {
            maxStep = 1;
        }

        if (character1.isHit()) {
            population.get(id2).addSome();
            population.get(id1).takeSome();
        }
        if (character2.isHit()) {
            population.get(id1).addSome();
            population.get(id2).takeSome();
        }
    }

    public void endGame(Character winner) {
        id1+=2;
        id2+=2;
        initCharacters();
    }

    public static Character getOpponent(Character character) {
        if (character.equals(character1)) {
            return character2;
        } else if (character.equals(character2)) {
            return character1;
        }
        return null;
    }
    
    public void draw(Graphics g) {
        gui.draw(g);
        character1.draw(g);
        character2.draw(g);
        if (!animate) {
            stats.draw(g);
        }
    }
    
    
    
    
    
    
    
    
    

    @Override
    public void mouseClicked(MouseEvent e) {
        if (getDist(character1.x,e.getX(),character1.y,e.getY())<Character.RADIUS) {
            System.out.println(character1.brain);
        }
        if (getDist(character2.x,e.getX(),character2.y,e.getY())<Character.RADIUS) {
            System.out.println(character2.brain);
        }
    }

    @Override
    public void keyPressed(KeyEvent e) {
        int code = e.getKeyCode();
        switch (code) {
            case KeyEvent.VK_P:
                paused = !paused;
                break;
            case KeyEvent.VK_SPACE:
                maxStep = MAXSTEP+1-maxStep;
                break;
            case KeyEvent.VK_A:
                animate = !animate;
                break;
            case KeyEvent.VK_S:
                if (!animate) stats.nextMode();
                break;
            case KeyEvent.VK_W:
                if (!animate) stats.prevMode();
                break;
            case KeyEvent.VK_D:
                debug = !debug;
                break;
        }
    }
}
