package neuralnets.fightinggame;

import java.awt.Graphics;
import java.awt.event.KeyEvent;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Set;

import javax.swing.JFrame;
import javax.swing.WindowConstants;

import kern.Game;
import kern.physics.RectObstacle;
import neuralnets.Member;
import neuralnets.Population;
import neuralnets.Stats;

public class AIFightingGame extends Game {

    private static final long serialVersionUID = 1L;

    public static void main(String[] args) {
        // Run UI in the Event Dispatcher Thread (EDT), instead of Main thread
        javax.swing.SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("YEUH");
            frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
            AIFightingGame game = new AIFightingGame(1280, 640);
            frame.setContentPane(game);
            frame.pack();
            frame.setVisible(true);
        });
    }

    private Population population;
    private Stats stats;

    private Character character1, character2;
    private MemberNode m1, m2;
    private int time;
    private int generation;

    private GUI gui;
    private RectObstacle stage, border1, border2;

    public static final int NUM = 100;
    private static final int MAXTIME = 60 * 15;

    private boolean oneGen, zip = false;

    private boolean animate = true;
    private Queue<MemberNode> frontier;
    private ArrayList<Integer> sortedIds;
    private int match;

    public AIFightingGame(int width, int height) {
        super(width, height);

        population = new Population(NUM, Character.INPUTS, 30, 10, Character.OUTPUTS);
        gui = new GUI(width, height);
        stats = new Stats(population, width, height - gui.lowerStage.height - gui.colorBar.height);

        double newHeight = height - gui.lowerStage.height - gui.colorBar.height;
        stage = new RectObstacle(width / 2., newHeight / 2., width, newHeight, 0);
        border1 = new RectObstacle(width / 4., newHeight / 2., width / 2., newHeight, 0);
        border2 = new RectObstacle(width * 3 / 4., newHeight / 2., width / 2., newHeight, 0);

        gui.r1.y = gui.r2.y = gui.colorBar.y - gui.r1.height;
        gui.r1.width = gui.r2.width = (int) (stage.width / NUM);

        newGeneration();
        gameStart();
    }

    private void newGeneration() {
        oneGen = false;
        if (generation > 0) population.killAndRepopulate(sortedIds);

        frontier = new LinkedList<>();
        sortedIds = new ArrayList<>();

        for (int n = 0; n < NUM; n++) { frontier.add(new MemberNode(n)); }

        stats.storePop(population);
        population.scramble();

        generation++;
        match = 0;

        Member oldest = population.getOldest();
        Member highestScore = population.getHighestTotal();
        Member highestAverage = population.getHighestAverage();

        gui.gen.display("Oldest: " + oldest.name + ", Age: " + oldest.age,
                "Highest Total Score: " + highestScore.name + ", Total Score: " + highestScore.totalScore,
                "Highest Average Score: " + highestAverage.name + ", Average Score: " + highestAverage.averageScore);
        gui.colorBar.display(population);

        initCharacters();
    }

    private void initCharacters() {
        if (!frontier.isEmpty()) {
            m1 = frontier.poll();
            m2 = frontier.poll();

            time = MAXTIME;

            character1 = new Character(population.get(m1.id), 180, stage, border1);
            character2 = new Character(population.get(m2.id), 0, stage, border2);

            gui.r1.x = (int) (m1.id * stage.width / NUM);
            gui.r2.x = (int) (m2.id * stage.width / NUM);

            character1.setOpponent(character2);
            character2.setOpponent(character1);

            // this needs to be fixed
            match++;
            int totalMatches = (int) (population.size / 2 * Math.log(population.size / 2));
            gui.game.display("Generation: " + generation, "Match: " + match + "/" + totalMatches);
        } else newGeneration();
    }

    private void doCharacterStuff() {
        character1.moveCharacter();
        character2.moveCharacter();

        if (character1.isHit()) character2.myMember.changeScore(1);
        if (character2.isHit()) character1.myMember.changeScore(1);
    }

    private void endGame() {
        // tournament sort

        if (character1.myMember.score > character2.myMember.score) {
            m1.betterThan.add(m2);
            frontier.add(m1);
        } else if (character1.myMember.score < character2.myMember.score) {
            m2.betterThan.add(m1);
            frontier.add(m2);
        } else {
            if (character1.myMember.averageScore > character2.myMember.averageScore) {
                m1.betterThan.add(m2);
                frontier.add(m1);
            } else if (character1.myMember.averageScore < character2.myMember.averageScore) {
                m2.betterThan.add(m1);
                frontier.add(m2);
            } else {
                m1.equalTo.add(m2);
                m1.betterThan.addAll(m2.betterThan);
                m1.equalTo.addAll(m2.equalTo);
                frontier.add(m1);
            }
        }

        character1.myMember.score = 0;
        character2.myMember.score = 0;

        while (frontier.size() == 1) {
            MemberNode best = frontier.poll();

            sortedIds.add(best.id);

            for (MemberNode m : best.equalTo) sortedIds.add(m.id);

            frontier.addAll(best.betterThan);
        }

        initCharacters();
    }

    private class MemberNode {
        Set<MemberNode> equalTo;
        Set<MemberNode> betterThan;
        int id;

        MemberNode(int id) {
            this.id = id;
            equalTo = new HashSet<>();
            betterThan = new HashSet<>();
        }

        @Override
        public String toString() { return "" + id; }
    }

    @Override
    public void gameUpdate() {
        while (oneGen) {
            doCharacterStuff();

            time--;
            gui.time.display(time);

            if (time <= 0) endGame();
        }
    }

    @Override
    public void draw(Graphics g) {
        gui.draw(g);
        character1.draw(g);
        character2.draw(g);

        gui.c1.display(character1.myMember.infoText());
        gui.c2.display(character2.myMember.infoText());

        if (!animate) stats.draw(g);
    }

    @Override
    public void keyPressed(KeyEvent e) {
        int code = e.getKeyCode();
        switch (code) {
            case KeyEvent.VK_P:
                // pause
                paused = !paused;
                break;
            case KeyEvent.VK_SPACE:
                // zip through generations
                zip = !zip;
                break;
            case KeyEvent.VK_CONTROL:
                // do one generation
                oneGen = true;
                break;
            case KeyEvent.VK_A:
                // I should change this but this toggles stats screen
                animate = !animate;
                break;
            case KeyEvent.VK_S:
                // changes stats mode
                if (!animate) stats.nextMode();
                break;
            case KeyEvent.VK_W:
                // changes stats mode
                if (!animate) stats.prevMode();
                break;
            default:
                // literally just here so that the linter likes me
        }
    }
}
