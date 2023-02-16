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

public class TournamentSort3 {

    private static final boolean debug = false;

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        Set<Node> items = new HashSet<>();
        for (int i = 0; i < 100000; i++) items.add(new Node(Math.floor(Math.random() * 100)));

        long start, end;

        ExecutorService single = Executors.newSingleThreadExecutor();
        ExecutorService fixed3 = Executors.newFixedThreadPool(3);
        ExecutorService fixed10 = Executors.newFixedThreadPool(10);
        ExecutorService cached = Executors.newCachedThreadPool();

//        start = System.currentTimeMillis();
//        sort(items, single);
//        end = System.currentTimeMillis();
//        System.out.println("Single: " + (end - start) + "ms");
//
//        start = System.currentTimeMillis();
//        sort(items, fixed3);
//        end = System.currentTimeMillis();
//        System.out.println("Fixed 3 threads: " + (end - start) + "ms");
//
//        start = System.currentTimeMillis();
//        sort(items, fixed10);
//        end = System.currentTimeMillis();
//        System.out.println("Fixed 10 threads: " + (end - start) + "ms");

        start = System.currentTimeMillis();
        sort(items, cached);
        end = System.currentTimeMillis();
        System.out.println("Cached: " + (end - start) + "ms");
    }

    public static List<Node> sort(Collection<Node> items, ExecutorService executor)
            throws InterruptedException, ExecutionException {
        Queue<Node> frontier = new LinkedList<>(items);
        List<Future<Node>> processes = new ArrayList<>();
        final int size = items.size();
        List<Node> sorted = new LinkedList<>();

        while (sorted.size() < size) {
            while (frontier.size() > 1 || !processes.isEmpty()) {
                for (int i = processes.size() - 1; i >= 0; i--) {
                    Future<Node> p = processes.get(i);
                    if (p.isDone()) {
                        processes.remove(i);
                        Node a = p.get();
                        if (debug) System.out.println("Putting " + a + " back on stack");
                        frontier.add(a);
                    }
                }

                if (frontier.size() > 1) {
                    Node a = frontier.poll();
                    Node b = frontier.poll();
                    processes.add(executor.submit(() -> {
                        if (debug) System.out.println("Comparing " + a + " and " + b);
                        int c = a.value > b.value ? 1 : a.value == b.value ? 0 : -1;
//                        Thread.sleep(10);

                        switch (c) {
                            case 1:
                                a.greaterThan.add(b);
                                if (debug) System.out.println(a + " is greater than " + b);
                                return a;
                            case 0:
                                a.equalTo.add(b);
                                a.equalTo.addAll(b.equalTo);
                                a.greaterThan.addAll(b.greaterThan);
                                if (debug) System.out.println(a + " and " + b + "are equal");
                                return a;
                            case -1:
                                b.greaterThan.add(a);
                                if (debug) System.out.println(b + " is greater than " + a);
                                return b;
                            default:
                                throw new Error("Something went wrong!");
                        }
                    }));
                }
            }
            if (frontier.size() == 1) { // you shouldnt have to check for this
                Node top = frontier.poll();
                if (debug) System.out.println(top + " is top of stack");
                sorted.add(top);
                sorted.addAll(top.equalTo);
                frontier.addAll(top.greaterThan);
            }
        }

        executor.shutdown();
        return sorted;
    }

    private static class Node {
        double value;
        Set<Node> greaterThan;
        Set<Node> equalTo;

        Node(double value) {
            this.value = value;
            greaterThan = new HashSet<>();
            equalTo = new HashSet<>();
        }

        Node(Node a) {
            this.value = a.value;
            greaterThan = a.greaterThan;
            equalTo = a.equalTo;
        }

        @Override
        public String toString() { return value + ""; }
    }

}