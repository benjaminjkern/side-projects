import java.awt.Color;
import java.util.ArrayList;

public class Population {
    private Member[] members;

    public static final int INPUTS = 4;
    private static final int NEURONSPERLAYER = 10;
    private static final int NEURONLAYERS = 2;
    public static final int OUTPUTS = 4;

    static final double MUTATION = 1;

    private int count;

    int size;

    public Population(int size) {
        members = new Member[size];
        for (int p=0;p<size;p++) {
            members[p] = new Member();
        }

        this.size = size;
    }

    public void killAndRepopulate() {
        int numToKill = AIFightingGame.NUM/2;
        
        sort(0); // sort by average score
        Member[] oldMembers = members;
        members = new Member[(size-numToKill)*2];

        for (int p=0;p<size-numToKill;p++) {
            members[p] = oldMembers[p];
            members[p].score = 0;
            members[p].age++;
            members[p+size-numToKill] = new Member(members[p]);
        }
        
        int newMembers = 1;
        
        size = (size-numToKill)*2;
        for (int i=1;i<=newMembers;i++) {
            members[size-i] = new Member();
        }
    }
    
    public int findDead() {
        sort(0); // sort by average score
        for (int i=0;i<size;i++) {
            if (members[i].getAverageScore()<0) {
                return size-i;
            }
        }
        return 0;
    }

    public void sort(int sortMode) {
        scramble();
        for (int m=0;m<size;m++) {
            for (int n=m+1;n<size;n++) {
                switch (sortMode) {
                    case 0: //averageScore
                        if (members[n].getAverageScore()>members[m].getAverageScore()) {
                            switchPlaces(m,n);
                        }
                        break;
                    case 1: //totalScore
                        if (members[n].totalScore>members[m].totalScore) {
                            switchPlaces(m,n);
                        }
                        break;
                    case 2: //age
                        if (members[n].name<members[m].name) {
                            switchPlaces(m,n);
                        }
                        break;
                    case 3: //most recent score
                        if (members[n].score>members[m].score) {
                            switchPlaces(m,n);
                        }
                        break;
                    case 4: //color 
                        int maxD = Math.min(members[n].daddies.length, members[m].daddies.length);
                        int d = 0;
                        while (d<maxD && members[n].daddies[d]==members[m].daddies[d]) {
                            d++;
                        }
                        if (d==maxD) {
                            if (members[n].daddies.length<members[m].daddies.length) {
                                switchPlaces(m,n);
                            }
                        } else {
                            if (members[n].daddies[d]<members[m].daddies[d]) {
                                switchPlaces(m,n);
                            }
                        }
                        break;
                }
            }
        }
    }

    public void scramble() {
        for (int m=0;m<size;m++) {
            int n = (int) (Math.random()*size);
            switchPlaces(m,n);
        }
    }

    public void printScores() {
        System.out.print("\n"+members[0].getAverageScore());
        for (int m=1;m<size;m++) {
            System.out.print(", "+members[m].getAverageScore());
        }
        System.out.println("\n");
    }

    public void switchPlaces(int id1, int id2) {
        Member tempMem = members[id2];
        members[id2] = members[id1];
        members[id1] = tempMem;
    }

    public Member get(int i) {
        return members[i];
    }

    public Member getHighestAverage() {
        sort(0); //sort by average score
        return members[0];
    }

    public Member getHighestTotal() {
        sort(1); //sort by total score
        return members[0];
    }

    public Member getOldest() {
        sort(2); //sort by age
        return members[0];
    }

    class Member {
        NeuralNet brain;
        Color color;
        int name;
        double totalScore;
        double score;
        int age;
        int[] daddies;

        public Member() {
            brain = new NeuralNet(INPUTS, NEURONSPERLAYER, NEURONLAYERS, OUTPUTS);
            color = Color.getHSBColor((float)Math.random(),1f, 1f);
            name = count;
            score = 0;
            totalScore = 0;
            age = 0;
            count++;
            daddies = new int[] {name};
        }

        public Member(Member m) {
            brain = new NeuralNet(m.brain, MUTATION);
            color = Population.getNewColor(m.color, 5);
            name = count;
            score = 0;
            totalScore = 0;
            age = 0;
            count++;
            daddies = new int[m.daddies.length+1];
            for (int d=0;d<m.daddies.length;d++) {
                daddies[d] = m.daddies[d];
            }
            daddies[m.daddies.length] = name;
        }

        public double getAverageScore() {
            return ((double)totalScore)/((double)age==0?1:age);
        }

        public void addSome() {
            double amount = 1;
            score += amount;
            totalScore += amount;
        }

        public void takeSome() {
            double amount = -100;
            score += amount;
            totalScore += amount;
        }
    }

    public static Color getNewColor(Color color, double mutation) {
        int red = (int)Math.round((Math.max(0,Math.min(255,(color.getRed()+(Math.random()*2-1)*mutation)))));
        int green = (int)Math.round((Math.max(0,Math.min(255,(color.getGreen()+(Math.random()*2-1)*mutation)))));
        int blue = (int)Math.round((Math.max(0,Math.min(255,(color.getBlue()+(Math.random()*2-1)*mutation)))));
        Color newColor = new Color(red,green,blue);
        return newColor;
    }
}
