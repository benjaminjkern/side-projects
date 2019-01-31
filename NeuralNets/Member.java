package neuralnets;

import java.awt.Color;
import kern.Tools;

class Member {

    private static final int INPUTS = 11;
    private static final int NEURONSPERLAYER = 9;
    private static final int NEURONLAYERS = 0;
    private static final int OUTPUTS = 6;

    private static final double MUTATION = 1;

    NeuralNet brain;
    Color color;
    
    int name, age;
    double totalScore, score, averageScore;
    
    int[] daddies;

    public Member(int name) {
        brain = new NeuralNet(INPUTS, NEURONSPERLAYER, NEURONLAYERS, OUTPUTS);
        color = Color.getHSBColor((float)Math.random(),1f, 1f);
        this.name = name;
        score = 0;
        totalScore = 0;
        age = 0;
        daddies = new int[] {name};
    }

    public Member(Member m, int name) {
        brain = new NeuralNet(m.brain, MUTATION);
        color = getNewColor(m.color, 5);
        this.name = name;
        score = 0;
        totalScore = 0;
        age = 0;
        daddies = new int[m.daddies.length+1];
        for (int d=0;d<m.daddies.length;d++) {
            daddies[d] = m.daddies[d];
        }
        daddies[m.daddies.length] = name;
    }
    
    public String infoText() {
        return "ID:"+name+"  Age:"+age+"  Average score:"+averageScore;
    }

    public void changeScore(double amount) {
        score += amount;
        totalScore += amount;
    }
    
    private static Color getNewColor(Color color, double mutation) {
        int red = getBitOfColor(color.getRed(), mutation);
        int green = getBitOfColor(color.getGreen(), mutation);
        int blue = getBitOfColor(color.getBlue(), mutation);
        return new Color(red, green, blue);
    }
    
    private static int getBitOfColor(int swatch, double mutation) {
        return (int) Math.round(Math.max(0, Math.min(255, (swatch + Tools.rand(-1, 1) * mutation))));
    }
}