package neuralnets;

import kern.Tools;

//Simple feed-forward neural network made for simple games

public class NeuralNet {
    
    private int inputs, outputs;
    
    public int inputs() {return inputs;}
    public int outputs() {return outputs;}
    
    LinearLayer[] layers;

    public NeuralNet(int inputCount, int neuronCount, int neuronLayers, int outputCount) {
        inputs = inputCount;
        outputs = outputCount;
        
        layers = new LinearLayer[neuronLayers+1];
        layers[0] = new LinearLayer(inputCount, neuronCount, true);
        for (int l=1;l<neuronLayers;l++) {
            layers[l] = new LinearLayer(neuronCount, neuronCount, true);
        }
        layers[neuronLayers] = new LinearLayer(neuronLayers>0?neuronCount:inputCount, outputCount, true);
    }

    //create a new neuralnet with a mutation (FOR GENETIC ALGORITHM)
    public NeuralNet(NeuralNet copyNet, double mutation) {
        inputs = copyNet.inputs();
        outputs = copyNet.outputs();
        
        layers = new LinearLayer[copyNet.layers.length];
        for (int l=0;l<copyNet.layers.length;l++) {
            layers[l] = new LinearLayer(copyNet.layers[l], mutation);
        }
    }

    //create a new neuralnet with a mutation (FOR TARGETED POPULATION LEARNING ALGORITHM)
    public NeuralNet(NeuralNet copyNet, NeuralNet targetNet, double learningStep) {
        //NEED TO IMPLEMENT
    }

    public double[] propagate(double[] inputs) {
        double[] scores = Tools.makeCopy(inputs); //this is my lazy way of copying the array so I'm not just mutating them
        for (int l=0;l<layers.length;l++) {
            if (l>0) scores = Tools.sigmoid(scores);
            scores = layers[l].propagate(scores);
        }
        return scores; //I have this separated because I might not want to always do it this way
    }

    public void backPropagate(double[] target, double gradStep) {
        //first off gonna do 
        //ugh
    }

    public String toString() {
        //NEED TO IMPLEMENT
        return "";
    }

    class LinearLayer {
        
        private double[][] weight;
        private double[] bias;
        
        LinearLayer(int input, int output, boolean hasBias) {
            weight = Tools.rand(-1, 1, output, input);
            bias = hasBias ? Tools.rand(-1, 1, output) : Tools.zeros(output);
        }
        
        LinearLayer(LinearLayer otherLayer, double mutation) {
            weight = Tools.add(Tools.rand(-mutation, mutation, otherLayer.weight.length, otherLayer.weight[0].length), Tools.makeCopy(otherLayer.weight));
            bias = Tools.add(Tools.rand(-mutation, mutation, otherLayer.bias.length), Tools.makeCopy(otherLayer.bias));
        }
        
        double[] propagate(double[] input) {
            return Tools.add(Tools.mult(weight, input), bias);
        }
    }
}
