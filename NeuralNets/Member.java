package neuralnets;

import java.awt.Color;
import kern.Tools;

public class Member {

    public NeuralNet brain;
    public Color color;
    
    public int name, age, games;
    public double totalScore, score, averageScore, mutation;
    
    int[] daddies;

    public Member(int name, int inputs, int neuronsPerPlayer, int neuronLayers, int outputs) {
        brain = new NeuralNet(inputs, neuronsPerPlayer, neuronLayers, outputs);
        color = Color.getHSBColor((float)Math.random(),1f, 1f);
        this.name = name;
        mutation = 1;
        score = 0;
        totalScore = 0;
        age = 0;
        daddies = new int[] {name};
        games = 0;
    }

    public Member(Member m, int name) {
        brain = new NeuralNet(m.brain, m.mutation);
        color = getNewColor(m.color, 5);
        this.name = name;
        score = 0;
        totalScore = 0;
        age = 0;
        mutation = m.mutation;
        
        daddies = new int[m.daddies.length+1];
        for (int d=0;d<m.daddies.length;d++) {
            daddies[d] = m.daddies[d];
        }
        daddies[m.daddies.length] = name;
        games = 0;
    }
    
    public String infoText() {
        return "ID:"+name+"  Age:"+age+"  Average score:"+averageScore;
    }

    public void changeScore(double amount) {
        score += amount;
        totalScore += amount;
        averageScore = totalScore/games;
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