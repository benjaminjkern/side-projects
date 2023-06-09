package kern;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class Tensor {

    protected int[] size;
    protected double[] data;

    public Tensor() {
        size = new int[0];
        data = new double[0];
    }

    public Tensor(double a) {
        size = new int[] { 1 };
        data = new double[] { a };
    }

    public Tensor(double[] data) {
        size = new int[] { data.length };
        this.data = data;
    }

    public Tensor(int[] size, double[] data) {
        if (totalSize(size) != data.length) throw new IllegalArgumentException("Data size did not match given size!");
        if (size.length == 0) this.size = new int[] { 1 };
        else this.size = size;
        this.data = data;
    }

    public Tensor(Tensor t) {
        size = new int[t.size.length];
        for (int s = 0; s < t.size.length; s++) size[s] = t.size[s];

        data = new double[t.data.length];
        for (int d = 0; d < t.data.length; d++) size[d] = t.size[d];
    }

    public static Tensor zeros(int[] size) { return new Tensor(size, new double[totalSize(size)]); }

    public static Tensor rand(double min, double max, int[] size) {
        return new Tensor(size, Tools.rand(min, max, totalSize(size)));
    }

    public static int totalSize(int[] size) {
        int totalSize = 1;
        for (int s = 0; s < size.length; s++) totalSize *= size[s];
        return totalSize;
    }

    public int totalSize() { return data.length; }

    public static void sizeMatch(Tensor... tensors) {
        for (int t = 0; t < tensors.length; t++) {
            if (tensors[t].size.length != tensors[0].size.length)
                throw new IllegalArgumentException("Tensor " + t + " did not match the size!");
            for (int s = 0; s < tensors[t].size.length; s++) if (tensors[t].size[s] != tensors[0].size[s])
                throw new IllegalArgumentException("Tensor " + t + " did not match the size!");
        }
    }

    public static Tensor add(Tensor... tensors) {
        double[] sumData = new double[tensors[0].totalSize()];

        sizeMatch(tensors);

        for (Tensor t : tensors) for (int d = 0; d < sumData.length; d++) sumData[d] += t.data[d];

        return new Tensor(tensors[0].size, sumData);
    }

    public static Tensor concat(Tensor... tensors) {
        int[] newSize = new int[tensors[0].size.length];
        double[] newData = new double[0];

        for (int s = 1; s < tensors[0].size.length; s++) { newSize[s] = tensors[0].size[s]; }

        for (Tensor t : tensors) {
            for (int s = 1; s < t.size.length; s++) {
                if (newSize[s] != t.size[s]) throw new IllegalArgumentException("Tensors must match in size!");
            }
            newSize[0] += t.size[0];
            newData = Tools.concat(newData, t.data);
        }
        return new Tensor(newData);
    }

    public static Tensor swapIndices(int a, int b) {
        return null; // TODO: Implement, although I dont really think we need this anymore
    }

    public Tensor get(int[] indices) {
        if (indices.length != size.length && !(indices.length == 0 && data.length == 1))
            throw new IllegalArgumentException(
                    "Length of indices must match size length of tensor. Use -1 to select entire row");
        List<Integer> returnSize = new ArrayList<>();
        IntStream dataIndices = IntStream.range(0, data.length);
        for (int i = 0; i < indices.length; i++) {
            if (indices[i] == -1) {
                returnSize.add(size[i]);
            } else {
                int mod = 1;
                for (int m = 0; m < i; m++) { mod *= size[m]; }
                final int rem = mod;
                final int j = i;
                dataIndices = dataIndices.filter(idx -> (idx / rem) % size[j] == indices[j]);
            }
        }

        List<Double> returnData = dataIndices.mapToObj(i -> data[i]).collect(Collectors.toList());

        int[] newSize = new int[returnSize.size()];
        for (int s = 0; s < returnSize.size(); s++) newSize[s] = returnSize.get(s);
        double[] newData = new double[returnData.size()];
        for (int s = 0; s < returnData.size(); s++) newData[s] = returnData.get(s);

        return new Tensor(newSize, newData);
    }

    public Tensor reshape(int[] newSize) {
        if (totalSize() != totalSize(newSize)) throw new IllegalArgumentException("Total size did not match!");
        return new Tensor(newSize, data);
    }

    public double[] flatten() { return data; }

    public double item() {
        if (totalSize() != 1)
            throw new IllegalArgumentException("item() can only be called with a single item tensor!");
        return data[0];
    }

    public double item(int i) { return data[i]; }

    @Override
    public String toString() { return Tools.print(size) + ": " + Tools.print(data); }

    public IndexedTensor index(String... indices) { return new IndexedTensor(this, indices); }

    public IndexedTensor index() { return new IndexedTensor(this); }
}
