import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class ParallelHeapSort {

    private static final boolean debug = false;

    public static void main(String[] args) throws InterruptedException, ExecutionException {

        Set<Node> items = new HashSet<>();
        for (int i = 0; i < 100000; i++) items.add(new Node(i));

        long start, end;

        ExecutorService single = Executors.newSingleThreadExecutor();
        ExecutorService fixed3 = Executors.newFixedThreadPool(3);
        ExecutorService fixed10 = Executors.newFixedThreadPool(10);
        ExecutorService cached = Executors.newCachedThreadPool();

        start = System.currentTimeMillis();
        sort(items, cached);
        end = System.currentTimeMillis();
        System.out.println("Single: " + (end - start) + "ms");

//        start = System.currentTimeMillis();
//        sort(items, fixed3);
//        end = System.currentTimeMillis();
//        System.out.println("Fixed 3 threads: " + (end - start) + "ms");
//
//        start = System.currentTimeMillis();
//        sort(items, fixed10);
//        end = System.currentTimeMillis();
//        System.out.println("Fixed 10 threads: " + (end - start) + "ms");
//
//        start = System.currentTimeMillis();
//        sort(items, cached);
//        end = System.currentTimeMillis();
//        System.out.println("Cached: " + (end - start) + "ms");
    }

    public static List<Node> sort(Collection<Node> items, ExecutorService executor)
            throws InterruptedException, ExecutionException {
        Queue<Node> frontier = new LinkedList<>(items);
        List<Future<Node>> processes = new ArrayList<>();
        final int size = items.size();
        List<Node> sorted = new LinkedList<>();

        Node heap = null;
        while (sorted.size() < size) {
            while (!frontier.isEmpty()) {
                Node top = frontier.poll();
                if (heap == null) heap = top;
                else heap.add(top);
            }
            heap = getTop(heap, executor);
            sorted.add(heap);
            if (debug) System.out.println(heap.size() + ": " + heap.full() + " is top of heap\n");
            if (heap.left != null) frontier.add(heap.left);
            if (heap.right != null) frontier.add(heap.right);
            heap = null;
        }

        executor.shutdown();
        return sorted;
    }

    public static Node getTop(Node heap, ExecutorService executor) throws InterruptedException, ExecutionException {
        if (heap == null) return null;
        int size;
        if (debug) {
            size = heap.size();
            System.out.println("Getting top of " + heap.full() + ", size: " + size);
        }
        Future<Node> topRightProcess = executor.submit(() -> getTop(heap.right, executor));

        Node topLeft = getTop(heap.left, executor);
        if (topLeft != null && compare(heap, topLeft) == -1) {
            double temp = heap.value;
            heap.value = topLeft.value;
            topLeft.value = temp;
            if (debug) System.out.println("Heap is now " + heap.full());
            if (debug && heap.size() != size) System.out.println("ERROR SIZE CHANGED");
        }
        Node topRight = topRightProcess.get();
        if (topRight != null && compare(heap, topRight) == -1) {
            double temp = heap.value;
            heap.value = topRight.value;
            topRight.value = temp;
            if (debug) System.out.println("Heap is now " + heap.full());
            if (debug && heap.size() != size) System.out.println("ERROR SIZE CHANGED");
        }
        if (debug) System.out.println(heap.full() + " has been sorted");
        return heap;
    }

    public static int compare(Node a, Node b) throws InterruptedException {
        if (debug) System.out.println("Comparing " + a + " to " + b);
        if (b == null) return 1;
//        Thread.sleep(1);
        return a.value > b.value ? 1 : a.value == b.value ? 0 : -1;
    }

    private static class Node {
        double value;
        public Node left;
        public Node right;
        public int depthFree;

        Node(double value) {
            this.value = value;
            this.depthFree = 0;
        }

        @Override
        public String toString() { return value + ""; }

        public String full() {
            if (left == this || right == this) throw new Error("RECURSION");
            return value + " ( " + (left != null ? left.full() : "@") + ", " + (right != null ? right.full() : "@")
                    + " )";
        }

        public void add(Node toAdd) {
            if (toAdd == null) return;
            if (toAdd.left != null) {
                add(toAdd.left);
                toAdd.left = null;
            }
            if (toAdd.right != null) {
                add(toAdd.right);
                toAdd.right = null;
            }
            if (left == null) {
                left = toAdd;
                return;
            }
            if (right == null) {
                right = toAdd;
                return;
            }
            if (left.depthFree == right.depthFree) {
                left.add(toAdd);
            } else {
                right.add(toAdd);
            }
            updateDepth();
        }

        public void updateDepth() {
            if (right == null || left == null) {
                this.depthFree = 0;
                return;
            }
            left.updateDepth();
            right.updateDepth();
            if (left.depthFree == right.depthFree) {
                this.depthFree = left.depthFree + 1;
                return;
            }
            this.depthFree = left.depthFree;
        }

        public int size() { return 1 + (right != null ? right.size() : 0) + (left != null ? left.size() : 0); }

        public int isValid() { return 0; }
    }
}
