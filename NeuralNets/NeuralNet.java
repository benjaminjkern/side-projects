
//Simple Single-layer neural network made for simple games

public class NeuralNet {
    
    LinearLayer[] layers;

    public NeuralNet(int inputCount, int neuronCount, int neuronLayers, int outputCount) {
        layers = new LinearLayer[neuronLayers+1];
        layers[0] = new LinearLayer(inputCount, neuronCount, true);
        for (int l=1;l<neuronLayers;l++) {
            layers[l] = new LinearLayer(neuronCount, neuronCount, true);
        }
        layers[neuronLayers] = new LinearLayer(neuronCount, outputCount, true);
    }

    //create a new neuralnet with a mutation (FOR GENETIC ALGORITHM)
    public NeuralNet(NeuralNet copyNet, double mutation) {
        layers = new LinearLayer[copyNet.layers.length];
        for (int l=0;l<copyNet.layers.length;l++) {
            layers[l] = new LinearLayer(copyNet.layers[l], mutation);
        }
    }

    //create a new neuralnet with a mutation (FOR TARGETED POPULATION LEARNING ALGORITHM)
    public NeuralNet(NeuralNet copyNet, NeuralNet targetNet, double learningStep) {
        //NEED TO IMPLEMENT
    }

    public double[] propogate(double[] inputs) {
        double[] scores = Game.makeCopy(inputs); //this is my lazy way of copying the array so I'm not just mutating them
        for (int l=0;l<layers.length;l++) {
            if (l<layers.length-1) scores = Game.sigmoid(scores);
            scores = layers[l].propogate(scores);
        }
        return Game.sigmoid(scores); //I have this separated because I might not want to always do it this way
    }

    public void backPropogate(double[] target, double gradStep) {
        //NEED TO IMPLEMENT
    }

    public String toString() {
        //NEED TO IMPLEMENT
        return null;
    }

    class LinearLayer {
        private double[][] weight;
        private double[] bias;
        
        LinearLayer(int input, int output, boolean hasBias) {
            weight = Game.rand(-1, 1, output, input);
            bias = hasBias ? Game.rand(-1, 1, output) : Game.zeros(output);
        }
        
        LinearLayer(LinearLayer otherLayer, double mutation) {
            weight = Game.add(Game.rand(-mutation, mutation, otherLayer.weight.length, otherLayer.weight[0].length), Game.makeCopy(otherLayer.weight));
            bias = Game.add(Game.rand(-mutation, mutation, otherLayer.bias.length), Game.makeCopy(otherLayer.bias));
        }
        
        double[] propogate(double[] input) {
            return Game.add(Game.mult(weight, input), bias);
        }
    }
}
