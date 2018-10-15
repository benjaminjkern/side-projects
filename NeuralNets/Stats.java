import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.geom.Line2D;
import java.util.LinkedList;

public class Stats {
    private PopulationStats[] stats;

    int mode;
    int size;

    double oldest = 1;
    double highestScore = 1;
    double highestTotal = 1;
    double lowestScore = 0;
    double lowestTotal = 0;

    private static final int KEEPAMOUNT = 500;
    private static final int EDGE = 20;
    private static final int MODES = 5;

    public Stats() {
        size = 0;
        mode = 0;
        stats = new PopulationStats[KEEPAMOUNT];
        stats[KEEPAMOUNT-1] = new PopulationStats(AIFightingGame.population);
    }

    public void store(Population p) {
        for (int s=0;s<KEEPAMOUNT-1;s++) {
            stats[s] = stats[s+1];
        }
        if (size<KEEPAMOUNT) {
            size++;
        }
        stats[KEEPAMOUNT-1] = new PopulationStats(p);
    }

    public void draw(Graphics g) {
        Graphics2D g2 = (Graphics2D) g;
        int num;
        int width = GUI.width-2*EDGE;
        int height = GUI.height-2*EDGE-GUI.LowerStage.HEIGHT;
        g.setColor(mode<=1?new Color(200,100,100):Color.WHITE);
        g.fillRect(EDGE,EDGE,width,height);
        if (mode<=1) {
            for (int s=KEEPAMOUNT-size;s<KEEPAMOUNT;s++) {
                num = stats[s].sortedByColor.length;
                for (int n=0;n<num;n++) {
                    g.setColor(mode==0?stats[s].sortedByColor[n]:stats[s].sortedByScore[n]);
                    g.fillRect(EDGE+s*width/KEEPAMOUNT,EDGE+n*height/num,(int)Math.ceil((double)width/(double)KEEPAMOUNT),(int)Math.ceil((double)height/(double)num));
                }
            }
        } else {
            double lMeasure = 0;
            double hMeasure = 1;
            double lastPoint = 0;
            double nextPoint = 0;

            Color midColor = Color.BLACK;
            num = 5;
            switch (mode) {
                case 2:
                    hMeasure = oldest;
                    midColor = Color.RED;
                    break;
                case 3:
                    hMeasure = highestTotal;
                    lMeasure = lowestTotal;
                    midColor = Color.GREEN;
                    break;
                case 4:
                    hMeasure = highestScore;
                    lMeasure = lowestScore;
                    midColor = Color.BLUE;
                    break;
            }
            for (int l = (int)lMeasure;l<=hMeasure;l++) {
                g.setColor(l%(Math.ceil((hMeasure-lMeasure)/50)*5)==0?Color.BLACK:Color.LIGHT_GRAY);
                if (l%(Math.ceil((hMeasure-lMeasure)/50))==0) g.drawLine(EDGE,(int)(EDGE+(hMeasure-l)*height/(hMeasure-lMeasure)),EDGE+width,(int)(EDGE+(hMeasure-l)*height/(hMeasure-lMeasure)));
                g.setFont(new Font("Courier New", Font.PLAIN, 10));
                if (l%(Math.ceil((hMeasure-lMeasure)/50)*5)==0) GUI.drawCenteredString(new String[] {""+l}, width+3*EDGE/2, (int)(EDGE+(hMeasure-l)*height/(hMeasure-lMeasure)), g);
            }
            for (int s=KEEPAMOUNT-size;s<KEEPAMOUNT;s++) {
                if (s>0) {
                    for (int n=0;n<num;n++) {
                        switch (mode) {
                            case 2:
                                lastPoint = stats[s-1].ages[n];
                                nextPoint = stats[s].ages[n];
                                break;
                            case 3:
                                lastPoint = stats[s-1].totalScores[n];
                                nextPoint = stats[s].totalScores[n];
                                break;
                            case 4:
                                lastPoint = stats[s-1].scores[n];
                                nextPoint = stats[s].scores[n];
                                break;
                        }
                        if (lastPoint>=lMeasure && nextPoint>= lMeasure && lastPoint<=hMeasure && nextPoint<= hMeasure) {
                            if (n==2) {
                                g2.setColor(midColor);
                            } else if (n==1||n==3) {
                                g2.setColor(new Color(midColor.getRed()/2,midColor.getGreen()/2,midColor.getBlue()/2));
                            } else {
                                g2.setColor(Color.BLACK);
                            }
                            g2.setStroke(new BasicStroke((n==0||n==2)?3:1));
                            g2.drawLine(EDGE+(s-1)*width/(KEEPAMOUNT-1),(int)(EDGE+(hMeasure-lastPoint)*height/(hMeasure-lMeasure)),EDGE+s*width/(KEEPAMOUNT-1),(int)(EDGE+(hMeasure-nextPoint)*height/(hMeasure-lMeasure)));
                        }
                    }
                }
            }
        }
        g2.setColor(Color.BLACK);
        g2.setStroke(new BasicStroke(2));
        g2.drawRect(EDGE-1,EDGE-1,width+1,height+1);
        g2.drawRect(EDGE-2,EDGE-2,width+3,height+3);
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

    class PopulationStats {
        Color[] sortedByColor;
        Color[] sortedByScore;
        double[] ages;
        double[] scores;
        double[] totalScores;

        PopulationStats(Population p) {
            sortedByColor = new Color[p.size];
            sortedByScore = new Color[p.size];
            ages = new double[5];
            scores = new double[5];
            totalScores = new double[5];
            
            ages[0] = Double.MIN_VALUE;
            totalScores[0] = Double.MIN_VALUE;
            scores[0] = Double.MIN_VALUE;
            
            ages[4] = Double.MAX_VALUE;
            totalScores[4] = Double.MAX_VALUE;
            scores[4] = Double.MAX_VALUE;
            
            p.sort(0);
            for (int s=0;s<p.size;s++) {
                sortedByScore[s] = p.get(s).color;
                
                ages[1] += Math.pow(p.get(s).age,2);
                totalScores[1] += Math.pow(p.get(s).totalScore,2);
                scores[1] += Math.pow(p.get(s).getAverageScore(),2);
                
                ages[2] += p.get(s).age;
                totalScores[2] += p.get(s).totalScore;
                scores[2] += p.get(s).getAverageScore();
                
                if (p.get(s).age > ages[0]) {
                    ages[0] = p.get(s).age;
                }
                if (p.get(s).age < ages[4]) {
                    ages[4] = p.get(s).age;
                }
                
                if (p.get(s).totalScore > totalScores[0]) {
                    totalScores[0] = p.get(s).totalScore;
                }
                if (p.get(s).totalScore < totalScores[4]) {
                    totalScores[4] = p.get(s).totalScore;
                }
                
                if (p.get(s).getAverageScore() > scores[0]) {
                    scores[0] = p.get(s).getAverageScore();
                }
                if (p.get(s).getAverageScore() < scores[4]) {
                    scores[4] = p.get(s).getAverageScore();
                }
            }
            
            ages[2] /= p.size;
            totalScores[2] /= p.size;
            scores[2] /= p.size;
            
            ages[1] /= p.size;
            totalScores[1] /= p.size;
            scores[1] /= p.size;
            
            ages[3] = Math.sqrt(ages[1]-ages[2]*ages[2]);
            totalScores[3] = Math.sqrt(totalScores[1]-totalScores[2]*totalScores[2]);
            scores[3] = Math.sqrt(scores[1]-scores[2]*scores[2]);
            
            ages[1] = ages[2]-ages[3];
            ages[3] = ages[2]+ages[3];
            
            totalScores[1] = totalScores[2]-totalScores[3];
            totalScores[3] = totalScores[2]+totalScores[3];
            
            scores[1] = scores[2]-scores[3];
            scores[3] = scores[2]+scores[3];
            
            if (scores[0] > highestScore) {
                highestScore = scores[0];
            }
            if (totalScores[0] > highestTotal) {
                highestTotal = totalScores[0];
            }
            if (ages[0] > oldest) {
                oldest = ages[0];
            }
            if (scores[4] < lowestScore) {
                lowestScore = scores[4];
            }
            if (totalScores[4] < lowestTotal) {
                lowestTotal = totalScores[4];
            }
            

            p.sort(4);
            for (int s=0;s<p.size;s++) {
                sortedByColor[s] = p.get(s).color;
            }
        }
    }
}
