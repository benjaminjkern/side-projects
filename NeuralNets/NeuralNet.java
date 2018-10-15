
//Simple Single-layer neural network made for simple games

public class NeuralNet {
    int inputCount, neuronCount, neuronLayers, outputCount;

    NeuronLayer[] layers;

    public NeuralNet(int inputCount, int neuronCount, int neuronLayers, int outputCount) {
        this.inputCount = inputCount;
        this.neuronCount = neuronCount;
        this.neuronLayers = neuronLayers;
        this.outputCount = outputCount;

        layers = new NeuronLayer[neuronLayers+2];
        layers[0] = new NeuronLayer(inputCount,null);
        for (int i=1;i<neuronLayers+1;i++) {
            layers[i] = new NeuronLayer(neuronCount,layers[i-1]);
        }
        layers[neuronLayers+1] = new NeuronLayer(outputCount, layers[neuronLayers]);
    }

    public NeuralNet(NeuralNet copyNet, double mutation) {
        this(copyNet.inputCount, copyNet.neuronCount, copyNet.neuronLayers, copyNet.outputCount);
        for (int i=1;i<neuronLayers+1;i++) {
            layers[i].copyNeurons(copyNet.layers[i], mutation);
        }
    }

    public double[] propogate(double[] inputs) {
        layers[0].inputValues(inputs);
        for (int n=1;n<neuronLayers+1;n++) {
            layers[n].propogate();
        }
        return layers[neuronLayers].valuesArray();
    }

    public void backPropogate(double[] target, double gradStep) {
        NeuralNet gradient = new NeuralNet(this, 0);
        
        for (int i=0;i<outputCount;i++) {
            gradient.layers[neuronLayers+1].neurons[i].bias = (target[i]-layers[neuronLayers+1].neurons[i].value)*layers[neuronLayers+1].neurons[i].value*(1-layers[neuronLayers+1].neurons[i].value);
        }
        
        double[][] yeuh;
        for (int n=neuronLayers;n>0;n--) {
            yeuh = Game.matMult(Game.transpose(layers[n].weightsArray()), Game.vect2Mat(gradient.layers[n+1].biasArray()));
            for (int i=0;i<layers[n].size;i++) {
                gradient.layers[n].neurons[i].bias = yeuh[i][0]*layers[n].neurons[i].value*(1-layers[n].neurons[i].value);
            }
            yeuh = Game.matMult(Game.vect2Mat(gradient.layers[n].biasArray()), Game.transpose(Game.vect2Mat(gradient.layers[n-1].valuesArray())));
            for (int i=0;i<layers[n].size;i++) {
                for (int j=0;j<layers[n].neurons[i].weights.length;j++) {
                    gradient.layers[n].neurons[i].weights[j] = yeuh[i][j];
                }
            }
        }
        
        //addNet(gradient, gradStep);
    }

    public static double sigmoid(double n) {
        return 1 / (1 + Math.exp(-n));
    }

    public static double dotprod(double[] a, double[] b) {
        if (a.length != b.length) {
            try {
                throw new Exception("Vectors must have equal size");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        double sum = 0;
        for (int i=0;i<a.length;i++) {
            sum += a[i]*b[i];
        }
        return sum;
    }

    public String toString() {
        String print = "-------------------------\nNew Net\n";
        for (int l=0;l<neuronLayers;l++) {
            int h=l+1;
            print += "-------------------------\nNeuron Layer "+h+":\n";
            for (int n=0;n<layers[l].neurons.length;n++) {
                print += Game.printArray(layers[l].neurons[n].weights) + "\n Bias: " + layers[l].neurons[n].bias + "\n";
            }
        }
        return print;
    }

    class NeuronLayer {
        int size;
        Neuron[] neurons;
        NeuronLayer previous;

        NeuronLayer(int count, NeuronLayer prev) {
            size = count;
            neurons = new Neuron[size];
            previous = prev;
            for (int c=0;c<size;c++) {
                neurons[c] = new Neuron();
            }
        }
        
        void copyNeurons(NeuronLayer other, double mutation) {
            for (int c=0;c<size;c++) {
                neurons[c].copyNeuron(other.neurons[c], mutation);
            }
        }

        void inputValues(double[] inputs) {
            if (inputs.length!=size) {
                try {
                    throw new Exception("Incorrect length of input vector");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            for (int c=0;c<size;c++) {
                neurons[c].value = inputs[c];
            }
        }

        void propogate() {
            for (int c=0;c<size;c++) {
                neurons[c].propogate();
            }
        }

        double[] valuesArray() {
            double[] output = new double[size];
            for (int c=0;c<size;c++) {
                output[c] = neurons[c].value;
            }
            return output;
        }
        
        double[] biasArray() {
            double[] output = new double[size];
            for (int c=0;c<size;c++) {
                output[c] = neurons[c].bias;
            }
            return output;
        }

        double[][] weightsArray() {
            double[][] output = new double[size][previous.size];
            for (int c=0;c<size;c++) {
                for (int d=0;d<previous.size;d++) {
                    output[c][d] = neurons[c].weights[d];
                }
            }
            return output;
        }

        class Neuron {
            double value;
            double bias;
            double[] weights;

            Neuron() {
                value = 0;
                if (previous != null) {
                    weights = new double[previous.size];
                    bias = Math.random()*2-1;
                    for (int c=0;c<previous.size;c++) {
                        weights[c] = Math.random()*2-1;
                    }
                }
            }
            
            void copyNeuron(Neuron other, double mutation) {
                for (int w=0;w<weights.length;w++) {
                    weights[w] = other.weights[w] + (Math.random()*2-1)*mutation;
                }
                bias = other.bias + (Math.random()*2-1)*mutation;
            }

            void propogate() {
                value = sigmoid(bias + dotprod(weights,previous.valuesArray()));
            }
        }
    }
}
