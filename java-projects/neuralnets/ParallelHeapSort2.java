import java.util.concurrent.ExecutionException;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.RecursiveTask;

public class ParallelHeapSort2 {

    private static final boolean RANDOM = false;
    private static final int NUM = 100000;

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        double[] items = new double[NUM];
        for (int i = 0; i < NUM; i++) items[i] = RANDOM ? Math.floor(Math.random() * NUM * 10) : i;
        System.out.println("Done creating items");

        long start, end;

        start = System.currentTimeMillis();
//        System.out.println(sort(items));
        double[] sorted = sort(items);
        end = System.currentTimeMillis();
        System.out.println("Fork join: " + (end - start) + "ms");
//        for (double d : sorted) System.out.print(d + " ");
    }

    private static double[] sort(double[] items) throws InterruptedException, ExecutionException {
        double[] sorted = new double[items.length];
        int count = 0;

        ForkJoinPool commonPool = ForkJoinPool.commonPool();
        while (count < items.length) {
            int top = commonPool.invoke(new Heapfixer(items, 0));
            sorted[count] = items[top];
            items[top] = Double.NaN;
            count++;
        }

        return sorted;
    }

    private static class Heapfixer extends RecursiveTask<Integer> {
        /**
         * 
         */
        private static final long serialVersionUID = 1L;
        double[] list;
        int index;

        Heapfixer(double[] list, int index) {
            this.list = list;
            this.index = index;
        }

        static int compare(double a, double b) throws InterruptedException {
            if (Double.isNaN(a)) return -1;
            if (Double.isNaN(b)) return 1;
            // sleep
            return a > b ? 1 : a == b ? 0 : -1;
        }

        @Override
        protected Integer compute() {
            if (index >= list.length) return index;
            int leftIndex = index * 2 + 1;
            double original = list[index];

            if (leftIndex >= list.length) return index;
            int rightIndex = index * 2 + 2;

            Heapfixer rightPart = null;
            if (rightIndex < list.length) {
                rightPart = new Heapfixer(list, rightIndex);
                rightPart.fork();
            }

            Heapfixer leftPart = new Heapfixer(list, leftIndex);
            int left = leftPart.compute();
            try {
                if (compare(list[index], list[left]) == -1) { index = left; }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            if (rightPart == null) return index;

            int right = rightPart.join();
            try {
                if (compare(list[index], list[right]) == -1) { index = right; }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return index;
        }
    }
}
