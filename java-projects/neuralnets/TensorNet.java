package neuralnets;

import kern.TensorFunction;
import kern.Tools;

public class TensorNet {

    TensorFunction[] layers;

    public TensorNet(int[] layerSizes, int[] tensorOrders) {
        if (layerSizes.length != tensorOrders.length + 1)
            throw new Error("The number of layers must equal the number of tensors + 1!");
        layers = new TensorFunction[layerSizes.length - 1];
        for (int l = 0; l < layerSizes.length - 1; l++) {
            layers[l] = new TensorFunction(layerSizes[l], layerSizes[l + 1], tensorOrders[l], 1);
        }
    }

    public TensorNet(TensorNet t, double mutation) {
        layers = new TensorFunction[t.layers.length];
        for (int l = 0; l < t.layers.length; l++) { layers[l] = new TensorFunction(t.layers[l], mutation); }
    }

    public double[] propagate(double[] inputs) {
        double[] values = inputs;
        for (int l = 0; l < layers.length; l++) {
            values = layers[l].call(values);
            // values = pass(values);
        }
        return values;
    }

    public void backPropagate(double[] inputs, double[] target, double gradStep) {
        double[] outputs = propagate(inputs);
        double[] error = Tools.subtract(outputs, target);
        double E = 0.5 * Tools.dotProduct(error, error);
        for (int l = layers.length - 1; l >= 0; l--) {
            double[][] newWeight = new double[0][0];
            error = Tools.mult(error, newWeight);
            for (int t = 0; t < layers[l].tensors.length; t++) {
//                IndexedTensor deriv = layers[l].tensors[t] = IndexedTensor.add(layers[l].tensors[t], deriv);
            }
        }
    }
}
