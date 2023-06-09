package kern;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class IndexedTensor extends Tensor {
    public List<String> indices;

    public IndexedTensor(Tensor t, String... indices) {
        super(t.size, t.data);
        if (indices.length != t.size.length && !(indices.length == 0 && t.data.length == 1))
            throw new IllegalArgumentException("Must index with the proper size!");
        this.indices = Arrays.asList(indices);
    }

    public IndexedTensor(int[] size, double[] data, String[] indices) {
        super(size, data);
        if (indices.length != size.length && !(indices.length == 0 && data.length == 1))
            throw new IllegalArgumentException("Must index with the proper size!");
        this.indices = Arrays.asList(indices);
    }

    public IndexedTensor swapIndices(Map<String, String> indexMap) { return null; }

    @Override
    public IndexedTensor get(int[] indices) {
        Tensor newTensor = new Tensor(this.size, this.data).get(indices);
        List<String> newIndices = new ArrayList<>();
        for (int i = 0; i < indices.length; i++) { if (indices[i] == -1) newIndices.add(this.indices.get(i)); }
        return new IndexedTensor(newTensor, newIndices.toArray(new String[0]));
    }

    public IndexedTensor get(Map<String, Integer> indexMap) {
        int[] newIndices = new int[indices.size()];
        for (int i = 0; i < indices.size(); i++) {
            newIndices[i] = indexMap.containsKey(indices.get(i)) ? indexMap.get(indices.get(i)) : -1;
        }
        return get(newIndices);
    }

    public double sumAll() { return sum(indices.toArray(new String[0])).item(); }

    public IndexedTensor sum(String... indices) {
        if (indices.length > 0) return sum(Tools.slice(indices, 1)).sum(indices[0]);
        return this;
    }

    public IndexedTensor sum(String index) { // needs to be fixed for multiple things
        int indexIndex = indices.indexOf(index);
        if (indexIndex == -1) return this;
        IndexedTensor[] tensorList = new IndexedTensor[size[indexIndex]];
        for (int s = 0; s < size[indexIndex]; s++) {
            Map<String, Integer> tempMap = new HashMap<>();
            tempMap.put(index, s);
            tensorList[s] = get(tempMap);
        }
        return add(tensorList);
    }

    public static IndexedTensor add(IndexedTensor... tensors) {
        Map<String, Integer> indexSizes = new HashMap<>();

        List<String> newIndices = new ArrayList<>();
        List<Integer> newSizes = new ArrayList<>();

        for (IndexedTensor it : tensors) {
            for (int i = 0; i < it.indices.size(); i++) {
                if (indexSizes.containsKey(it.indices.get(i))) {
                    if (indexSizes.get(it.indices.get(i)) != it.size[i])
                        throw new IllegalArgumentException("Tensor sizes must match along the same indices!");
                    continue;
                }
                indexSizes.put(it.indices.get(i), it.size[i]);
                newIndices.add(it.indices.get(i));
                newSizes.add(it.size[i]);
            }
        }

        int[] newSize = new int[newSizes.size()];
        for (int s = 0; s < newSizes.size(); s++) newSize[s] = newSizes.get(s);

        double[] newData = new double[totalSize(newSize)];
        for (int d = 0; d < newData.length; d++) {
            newData[d] = 0;
            Map<String, Integer> getMap = new HashMap<>();
            int thisIndex = d;
            for (int i = newIndices.size() - 1; i >= 0; i--) {
                int mod = 1;
                for (int j = 0; j < i; j++) { mod *= newSize[j]; }
                getMap.put(newIndices.get(i), thisIndex / mod);
                thisIndex = thisIndex - mod * (thisIndex / mod);
            }
            for (IndexedTensor it : tensors) { newData[d] += it.get(getMap).item(); }
        }
        return new IndexedTensor(new Tensor(newSize, newData), newIndices.toArray(new String[0]));
    }

    public static IndexedTensor mult(IndexedTensor... tensors) {
        Map<String, Integer> indexSizes = new HashMap<>();

        List<String> newIndices = new ArrayList<>();
        List<Integer> newSizes = new ArrayList<>();

        for (IndexedTensor it : tensors) {
            for (int i = 0; i < it.indices.size(); i++) {
                if (indexSizes.containsKey(it.indices.get(i))) {
                    if (indexSizes.get(it.indices.get(i)) != it.size[i])
                        throw new IllegalArgumentException("Tensor sizes must match along the same indices!");
                    continue;
                }
                indexSizes.put(it.indices.get(i), it.size[i]);
                newIndices.add(it.indices.get(i));
                newSizes.add(it.size[i]);
            }
        }

        int[] newSize = new int[newSizes.size()];
        for (int s = 0; s < newSizes.size(); s++) newSize[s] = newSizes.get(s);

        double[] newData = new double[totalSize(newSize)];
        for (int d = 0; d < newData.length; d++) {
            newData[d] = 1;
            Map<String, Integer> getMap = new HashMap<>();
            int thisIndex = d;
            for (int i = newIndices.size() - 1; i >= 0; i--) {
                int mod = 1;
                for (int j = 0; j < i; j++) { mod *= newSize[j]; }
                getMap.put(newIndices.get(i), thisIndex / mod);
                thisIndex = thisIndex - mod * (thisIndex / mod);
            }
            for (IndexedTensor it : tensors) { newData[d] *= it.get(getMap).item(); }
        }
        return new IndexedTensor(new Tensor(newSize, newData), newIndices.toArray(new String[0]));
    }

    @Override
    public String toString() { return super.toString() + " with " + indices.toString(); }

    // dont really need this method because you can just do Tensor.zeros().index()
    public static IndexedTensor zeros(int[] size, String... indices) {
        return new IndexedTensor(Tensor.zeros(size), indices);
    }
}
