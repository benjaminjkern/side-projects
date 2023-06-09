import java.util.concurrent.ExecutionException;

public class ParallelHeapSort3 {

    private static final boolean debug = false;

    public static void main(String[] args) throws InterruptedException, ExecutionException {

        double[] items = new double[10];
        for (int d = 0; d < 10; d++) items[d] = d;

        double[] sorted = sort(items);
        for (int d = 0; d < 10; d++) System.out.print(sorted[d] + " ");

//        Set<Node> items = new HashSet<>();
//        for (int i = 0; i < 10; i++) items.add(new Node(i));
//
//        long start, end;
//
//        start = System.currentTimeMillis();
//        sort(items);
//        end = System.currentTimeMillis();
//        System.out.println("Single: " + (end - start) + "ms");

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

    public static double[] sort(double[] items) throws InterruptedException, ExecutionException {
        Node heap = new Node(items[0]);
        for (int d = 1; d < items.length; d++) heap.add(d);

        double[] sorted = new double[items.length];

        for (int d = 0; d < items.length; d++) {
            System.out.println(heap.full());
            sorted[d] = heap.popTop().value;
        }

        return sorted;
    }

    private static class Node {
        double value;
        Node left;
        Node right;
        Node top;
        int depth;

        Node(double value) {
            this.value = value;
            depth = 0;
            top = this;
        }

        @Override
        public String toString() { return value + ""; }

        public String full() {
            return value + " {" + top + "}" + " ( " + (left != null ? left.full() : "-") + " , "
                    + (right != null ? right.full() : "-") + " )";
        }

        public static int compare(Node a, Node b) { return a.value > b.value ? 1 : a.value == b.value ? 0 : -1; }

        public void add(double d) { add(new Node(d)); }

        public void add(Node newNode) {
            if (depth == 0) {
                if (left == null) left = newNode;
                else {
                    right = newNode;
                    depth = 1;
                }
            } else {
                if (left.depth == right.depth) left.add(newNode);
                else {
                    right.add(newNode);
                    depth = right.depth + 1;
                }
            }
            if (compare(top, newNode) == -1) top = newNode;
        }

        public Node popTop() {
            if (top == null) throw new Error("This shouldnt have happened");

            if (top == this) {
                if (left == null) { // no more children
                    top = null;
                    return this;
                }
                if (right == null || right.top == null) { // only left child
                    right = null; // sometimes redundant
                    if (left.top == null) {
                        left = null;
                        top = null;
                    } else top = left.top;
                    return this;
                }

                if (compare(left.top, right.top) == -1) { // compare the two and point towards higher
                    top = right.top;
                } else top = left.top;
                return this;
            }

            Node popTop;

            if (left == null) throw new Error("This shouldn't have happened");
            if (right == null) {
                popTop = left.popTop();
                if (left.top == null) {
                    top = this;
                    left = null;
                    return popTop;
                }
                if (compare(top, left.top) == -1) top = left.top;
                else top = this;
                return popTop;
            }

            if (top == left.top) {
                popTop = left.popTop();
            } else if (top == right.top) {
                popTop = right.popTop();
            } else throw new Error("Not sure how it got here");

            if (right.top == null) {
                right = null;
                if (left.top == null) {
                    top = this;
                    left = null;
                    return popTop;
                }
                if (compare(top, left.top) == -1) top = left.top;
                else top = this;
                return popTop;
            }

            if (left.top == null) {
                if (compare(top, right.top) == -1) top = right.top;
                else top = this;
                return popTop;
            }

            // reset top
            top = this;
            if (compare(top, left.top) == -1) top = left.top;
            if (compare(top, right.top) == -1) top = right.top;

            return popTop;
        }
    }
}
