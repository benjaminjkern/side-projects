package neuralnets;

import kern.Tools;

//Simple feed-forward neural network made for simple games

public class NeuralNet {

    private int inputs, outputs;

    public int inputs() { return inputs; }

    public int outputs() { return outputs; }

    LinearLayer[] layers;

    public NeuralNet(int inputCount, int neuronCount, int neuronLayers, int outputCount) {
        inputs = inputCount;
        outputs = outputCount;

        layers = new LinearLayer[neuronLayers + 1];
        layers[0] = new LinearLayer(inputCount, neuronCount, true);
        for (int l = 1; l < neuronLayers; l++) { layers[l] = new LinearLayer(neuronCount, neuronCount, true); }
        layers[neuronLayers] = new LinearLayer(neuronLayers > 0 ? neuronCount : inputCount, outputCount, true);
    }

    // create a new neuralnet with a mutation (FOR GENETIC ALGORITHM)
    public NeuralNet(NeuralNet copyNet, double mutation) {
        inputs = copyNet.inputs();
        outputs = copyNet.outputs();

        layers = new LinearLayer[copyNet.layers.length];
        for (int l = 0; l < copyNet.layers.length; l++) { layers[l] = new LinearLayer(copyNet.layers[l], mutation); }
    }

    // create a new neuralnet with a mutation (FOR TARGETED POPULATION LEARNING
    // ALGORITHM)
    public NeuralNet(NeuralNet copyNet, NeuralNet targetNet, double learningStep) {
        // NEED TO IMPLEMENT
    }

    public double[] propagate(double[] inputs) {
        double[] scores = inputs;
        for (int l = 0; l < layers.length; l++) { scores = layers[l].propagate(scores); }
        return scores; // might not always want to run a sigmoid on the final output
    }

    public void backPropagate(double[] target, double[] input, double gradStep) {
        double[] output = propagate(input);

        double[] p = Tools.subtract(output, target);
        for (int l = layers.length - 1; l >= 0; l--) {
            double[] dBias = Tools.cMult(p, layers[l].sigma());
            double[][] dWeight = Tools.outerProduct(dBias, layers[l].lastInput);
            p = Tools.mult(dBias, layers[l].weight);
//            if (Tools.squareSum(dBias) > 0)
            layers[l].bias = Tools.subtract(layers[l].bias, Tools.mult(gradStep, dBias));
//            if (Tools.squareSum(dWeight) > 0)
            layers[l].weight = Tools.subtract(layers[l].weight, Tools.mult(gradStep, dWeight));
        }
    }

    public void backPropagate(double[][] targets, double[][] inputs, double gradStep) {
        if (targets.length != inputs.length) throw new Error("Must have an input for each target");
        double[][] dBias = new double[layers.length][];
        double[][][] dWeight = new double[layers.length][][];

        for (int l = layers.length - 1; l >= 0; l--) {
            dBias[l] = new double[layers[l].bias.length];
            dWeight[l] = new double[layers[l].weight.length][layers[l].weight[0].length];
        }

        for (int o = 0; o < targets.length; o++) {
            double[] output = propagate(inputs[o]);

            double[] p = Tools.subtract(output, targets[o]);
            for (int l = layers.length - 1; l >= 0; l--) {
                double[] nBias = Tools.cMult(p, layers[l].sigma());
                double[][] nWeight = Tools.outerProduct(nBias, layers[l].lastInput);
                dBias[l] = Tools.add(dBias[l], nBias);
                dWeight[l] = Tools.add(dWeight[l], nWeight);
                p = Tools.mult(nBias, layers[l].weight);
            }
        }

        for (int l = layers.length - 1; l >= 0; l--) {
            layers[l].bias = Tools.subtract(layers[l].bias, Tools.mult(gradStep, dBias[l]));
            layers[l].weight = Tools.subtract(layers[l].weight, Tools.mult(gradStep, dWeight[l]));
        }
    }

    @Override
    public String toString() {
        // NEED TO IMPLEMENT
        return "";
    }

    class LinearLayer {

        private double[][] weight;
        private double[] bias;
        LinearLayer next;

        double[] lastInput;
        double[] lastOutput;

        LinearLayer(int inputs, int outputs, boolean hasBias) {
            weight = Tools.rand(-1, 1, outputs, inputs);
            bias = hasBias ? Tools.rand(-1, 1, outputs) : Tools.zeros(outputs);
        }

        LinearLayer(LinearLayer otherLayer, double mutation) {
            weight = Tools.add(Tools.rand(-mutation, mutation, otherLayer.weight.length, otherLayer.weight[0].length),
                    otherLayer.weight);
            bias = Tools.add(Tools.rand(-mutation, mutation, otherLayer.bias.length), otherLayer.bias);
        }

        double[] propagate(double[] input) {
            lastInput = input;
            lastOutput = Tools.sigmoid(Tools.add(Tools.mult(weight, input), bias));
            return lastOutput;
        }

        double[] sigma() {
            return Tools.cMult(lastOutput, Tools.subtract(1, lastOutput));
//            double[] output = new double[lastOutput.length];
//            for (int o = 0; o < lastOutput.length; o++) { output[o] = lastOutput[o] > 0 ? 1 : 0; }
//            return output;
        }
    }
}
