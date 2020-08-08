package neuralnets;

import java.util.List;
import java.util.Random;

import kern.Tools;

public class Population {
    private Member[] members;

    private int count; // for keeping track of members with names as the count
    public int size;
    private int inputs, neuronsPerLayer, neuronLayers, outputs;

    public Population(int size, int inputs, int neuronsPerLayer, int neuronLayers, int outputs) {
        count = 0;
        this.size = size;

        members = new Member[size];
        for (int p = 0; p < size; p++) {
            members[p] = new Member(count, inputs, neuronsPerLayer, neuronLayers, outputs);
            count++;
        }
        this.inputs = inputs;
        this.neuronsPerLayer = neuronsPerLayer;
        this.neuronLayers = neuronLayers;
        this.outputs = outputs;
    }

    public void killAndRepopulate(List<Integer> sortedIds) {
        Member[] oldMembers = members;
        members = new Member[size];

        for (int p = 0; p < size / 2; p++) {
            int id = sortedIds.get(p);
            members[p] = oldMembers[id];
            members[p].age++;
            members[p + size / 2] = new Member(members[p], count);
            count++;
        }

        // a brand new member is added just to keep diversity
        members[size - 1] = new Member(count, inputs, neuronsPerLayer, neuronLayers, outputs);
        count++;
    }

    public void killAndRepopulate() {

        // sort by average score
        scramble();
        sort(getAverageScores());
        Member[] oldMembers = members;
        members = new Member[size];

        // the better half of the population goes on and makes a slightly mutated copy
        // of itself, while the other half is overwritten
        for (int p = 0; p < size / 2; p++) {
            members[p] = oldMembers[p];
            members[p].age++;
            members[p + size / 2] = new Member(members[p], count);
            count++;
        }

        // a brand new member is added just to keep diversity
        members[size - 1] = new Member(count, inputs, neuronsPerLayer, neuronLayers, outputs);
        count++;
    }

    public void sort(double[] values) {
        double[] sortedValues = Tools.makeCopy(values);
        for (int m = 0; m < size; m++) {
            for (int n = m + 1; n < size; n++) {
                if (sortedValues[n] > sortedValues[m]) {
                    switchPlaces(m, n);

                    double value = sortedValues[m];
                    sortedValues[m] = sortedValues[n];
                    sortedValues[n] = value;
                }
            }
        }
    }

    public void sortByColors() {
        for (int m = 0; m < size; m++) {
            for (int n = m + 1; n < size; n++) {
                // sort by colors!
                int maxD = Math.min(members[n].daddies.length, members[m].daddies.length);
                int d = 0;

                while (d < maxD && members[n].daddies[d] == members[m].daddies[d]) { d++; }

                if (d == maxD) {
                    if (members[n].daddies.length < members[m].daddies.length) { switchPlaces(m, n); }
                } else {
                    if (members[n].daddies[d] < members[m].daddies[d]) { switchPlaces(m, n); }
                }
            }
        }
    }

    public void print() {
        double[] output = new double[size];

        for (int m = 0; m < size; m++) { output[m] = members[m].name; }
        System.out.println(Tools.print(output));
    }

    public void scramble() {
        for (int m = 0; m < size; m++) {
            int n = new Random().nextInt(size);
            switchPlaces(m, n);
        }
    }

    public void switchPlaces(int id1, int id2) {
        Member tempMem = members[id2];
        members[id2] = members[id1];
        members[id1] = tempMem;
    }

    public Member get(int i) { return members[i]; }

    public double[] getAges() {
        double[] output = new double[size];

        for (int m = 0; m < size; m++) { output[m] = members[m].age; }
        return output;
    }

    public double[] getTotalScores() {
        double[] output = new double[size];

        for (int m = 0; m < size; m++) { output[m] = members[m].totalScore; }
        return output;
    }

    public double[] getAverageScores() {
        double[] output = new double[size];

        for (int m = 0; m < size; m++) { output[m] = members[m].averageScore; }
        return output;
    }

    public double[] getGensIn() {
        double[] output = new double[size];

        for (int m = 0; m < size; m++) { output[m] = members[m].daddies.length; }
        return output;
    }

    public Member getHighestAverage() {
        int idx = 0;

        for (int m = 0; m < size; m++) { if (members[m].averageScore > members[idx].averageScore) { idx = m; } }
        return members[idx];
    }

    public Member getHighestTotal() {
        int idx = 0;

        for (int m = 0; m < size; m++) { if (members[m].totalScore > members[idx].totalScore) { idx = m; } }
        return members[idx];
    }

    public Member getOldest() {
        int idx = 0;

        for (int m = 0; m < size; m++) { if (members[m].age > members[idx].age) { idx = m; } }
        return members[idx];
    }
}
