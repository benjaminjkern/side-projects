package kern;

public class TensorFunction {

    public int inputs, outputs;

    public IndexedTensor[] tensors;

    public TensorFunction(int inputs, int outputs, int order) { construct(inputs, outputs, order, 0); }

    public TensorFunction(int inputs, int outputs, int order, double[] data) {
        construct(inputs, outputs, order, 0);
        set(data);
    }

    public TensorFunction(int inputs, int outputs, int order, double range) {
        construct(inputs, outputs, order, range);
    }

    private void construct(int inputs, int outputs, int order, double range) {
        this.inputs = inputs;
        this.outputs = outputs;

        tensors = new IndexedTensor[order + 1];
        for (int o = 0; o <= order; o++) {
            int[] size = new int[o + 1];
            String[] indexList = new String[o + 1];
            size[0] = outputs;
            indexList[0] = "a";
            for (int s = 1; s <= o; s++) {
                size[s] = inputs;
                indexList[s] = "i" + s;
            }
            tensors[o] = new IndexedTensor(size, Tools.rand(-range, range, outputs * (int) Math.pow(inputs, o)),
                    indexList);
        }
    }

    private void set(double[] data) {}

    public TensorFunction(TensorFunction other, double mutation) {
        construct(other.inputs, other.outputs, other.tensors.length - 1, mutation);
        for (int t = 0; t < tensors.length; t++) { tensors[t] = IndexedTensor.add(tensors[t], other.tensors[t]); }
    }

    public double[] call(double[] inputs) {
        Tensor x = new Tensor(new int[] { inputs.length }, inputs);
        IndexedTensor result = tensors[0];
        for (int t = 1; t < tensors.length; t++) {
            IndexedTensor term = tensors[t];
            for (int r = 0; r < t; r++) {
                String currentIndex = tensors[t].indices.get(r + 1);
                term = IndexedTensor.mult(term, new IndexedTensor(x, currentIndex)).sum(currentIndex);
            }
            result = IndexedTensor.add(result, term);
        }
        return result.data;
    }
}
