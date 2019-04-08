package neuralnets;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import kern.Tools;

public class Stats {
    
    //this still isnt idealized but its pretty alright for now

    int mode;
    int size;
    int height;
    int width;

    Color[][] sortedByColor;
    GameStat ages;
    GameStat totalScores;
    GameStat averageScores;
    GameStat ancestors;

    private static final int KEEPAMOUNT = 500;
    private static final int EDGE = 20;
    private static final int MODES = 5;
    private static final int SPLIT = 10;

    public Stats(Population p, int width, int height) {
        size = 0;
        mode = 0;

        this.width = width-2*EDGE;
        this.height = height-2*EDGE;

        sortedByColor = new Color[KEEPAMOUNT][p.size()];
        ages = new GameStat(SPLIT, KEEPAMOUNT);
        totalScores = new GameStat(SPLIT, KEEPAMOUNT);
        averageScores = new GameStat(SPLIT, KEEPAMOUNT);
        ancestors = new GameStat(SPLIT, KEEPAMOUNT);

        storePop(p);
    }

    public void draw(Graphics g) {
        Graphics2D g2 = (Graphics2D) g;

        //draw box
        g.setColor(mode == 0 ? new Color(200,100,100) : Color.WHITE);
        g.fillRect(EDGE,EDGE,width,height);

        //if its a color mode, draw the colors
        if (mode==0) {
            int num = sortedByColor[0].length;
            for (int s = KEEPAMOUNT - size; s < KEEPAMOUNT; s++) {
                for (int n = 0; n < num; n++) {
                    g.setColor(sortedByColor[s][n]);
                    g.fillRect(EDGE + s * width / KEEPAMOUNT, EDGE + n * height / num, (int) Math.ceil((double) width / (double) KEEPAMOUNT), (int) Math.ceil((double) height / (double) num));
                }
            }
        } else {
            //otherwise, draw the charts
            switch (mode) {
                default:
                case 1:
                    ages.draw(Color.RED, g2);
                    break;
                case 2:
                    totalScores.draw(Color.GREEN, g2);
                    break;
                case 3:
                    averageScores.draw(Color.BLUE, g2);
                    break;
                case 4:
                    ancestors.draw(Color.YELLOW, g2);
            }
        }

        //Draw border (easy)
        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(2));
        g2.drawRect(EDGE - 1, EDGE - 1, width + 1, height + 1);
        g2.drawRect(EDGE - 2, EDGE - 2, width + 3, height + 3);
    }

    public void storePop(Population p) {
        //store population in to my wrapper class
        ages.addStats(p.getAges());
        totalScores.addStats(p.getTotalScores());
        averageScores.addStats(p.getAverageScores());
        ancestors.addStats(p.getGensIn());

        //this is for the colors because its easier to store them as a transposed version
        
        //shift down array
        for (int i = KEEPAMOUNT - size; i < KEEPAMOUNT-1; i++) {
            sortedByColor[i] = makeCopy(sortedByColor[i+1]);
        }

        //store colors and info at the end of each array, the color ones have to be more complicated because I dont have calls that return an array of colors and I dont wanna bother with that
        p.sortByColors();
        for (int s = 0; s < p.size(); s++) {
            sortedByColor[KEEPAMOUNT-1][s] = p.get(s).color;
        }

        //update size
        if (size < KEEPAMOUNT) {
            size++;
        }
    }

    //copied from Game class, I didnt have one that would work with colors
    private Color[] makeCopy(Color[] c) {
        Color[] output = new Color[c.length];

        for (int y=0;y<c.length;y++) {
            output[y] = c[y];
        }
        return output;
    }

    public void nextMode() {
        mode = (mode+1)%MODES;
    }

    public void prevMode() {
        mode--;
        if (mode<0) {
            mode+=MODES;
        }
    }
    
    private class GameStat {
        //This is a wrapper class so that I can store various types of statistics and reuse it as well as draw my different charts
        
        double highest;
        double lowest;
        double[][] scores;
        int split;
        int keepAmount;
        
        GameStat(int split, int keepAmount) {
            this.split = split;
            this.keepAmount = keepAmount;
            highest = 1;
            lowest = 0;
            scores = new double[split + 1][keepAmount];
        }
        
        void addStats(double[] values) {
            scores = Tools.transpose(scores);

            for (int i = keepAmount - size; i < keepAmount-1; i++) {
                scores[i] = scores[i+1];
            }

            double[] sortedArray = Tools.sort(values);
            double[] createdStats = new double[SPLIT + 1];

            //pick the percentile ranking and store those
            for (int i = 0; i < SPLIT + 1; i++) {
                double s = (double) (values.length-1) * (double) i / (double) SPLIT;
                double w = s % 1;
                createdStats[i] = sortedArray[(int) s]*(1-w) + (s < values.length-1 ? sortedArray[(int) (s+1)]*w : 0);
            }
            
            scores[keepAmount-1] = createdStats;
            
            scores = Tools.transpose(scores);

            if (scores[0][keepAmount - 1] > highest) {
                highest = scores[0][keepAmount - 1];
            }
            if (scores[split][keepAmount - 1] < lowest) {
                lowest = scores[split][keepAmount - 1];
            }
        }

        void draw(Color color, Graphics2D g2) {
            //Draw GRID
            for (int l = (int) lowest; l <= highest; l++) {
                g2.setColor(l % (Math.ceil((highest - lowest) / 50) * 5) == 0 ? Color.BLACK : Color.LIGHT_GRAY);
                if (l % (Math.ceil((highest - lowest) / 50)) == 0) g2.drawLine(EDGE, (int) (EDGE + (highest - l) * height / (highest - lowest)), EDGE + width, (int) (EDGE + (highest - l) * height / (highest - lowest)));
                g2.setFont(new Font("Courier New", Font.PLAIN, 10));
                if (l % (Math.ceil((highest - lowest) / 50)*5) == 0) Tools.drawCenteredString(new String[] {"" + l}, width + 3 * EDGE / 2, (int) (EDGE + (highest - l) * height / (highest - lowest)), g2);
            }

            //Draw CHARTS
            for (int n = 0; n < split + 1; n++) {
                double w = 1 - (double) Math.abs(2*n - split) / (double) split;
                g2.setColor(new Color((int)(color.getRed()*w), (int)(color.getGreen()*w), (int)(color.getBlue()*w)));
                if (w == 0) w = 1;
                g2.setStroke(new BasicStroke((int) (2*w + 1)));

                for (int s = keepAmount - size + 1; s < keepAmount; s++) {
                    double lastPoint = scores[n][s-1];
                    double nextPoint = scores[n][s];
                    g2.drawLine(EDGE+(s-1)*width/(keepAmount-1),(int)(EDGE+(highest-lastPoint)*height/(highest-lowest)),EDGE+s*width/(keepAmount-1),(int)(EDGE+(highest-nextPoint)*height/(highest-lowest)));
                }
            }
        }
    }
}
