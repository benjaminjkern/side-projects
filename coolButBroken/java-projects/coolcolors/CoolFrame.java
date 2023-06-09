package coolcolors;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Random;
import java.util.Set;

import kern.Keyframe;
import kern.Triplet;

public class CoolFrame extends Keyframe {

    GridSquare[][] squares;
    int numPoints, gridSpacing;

    CoolFrame(int width, int height, CoolFrame parent, int numPoints, int gridSpacing) {
        super(width, height, parent);
        this.numPoints = numPoints;
        this.gridSpacing = gridSpacing;

        squares = new GridSquare[gridSpacing][gridSpacing];
        for (int gy = 0; gy < gridSpacing; gy++) for (int gx = 0; gx < gridSpacing; gx++) {
            squares[gy][gx] = new GridSquare();
        }

        for (int r = 0; r < numPoints; r++) {
            double rx = Math.random();
            double ry = Math.random();
            squares[(int) (ry * gridSpacing)][(int) (rx * gridSpacing)].addPoint(rx * gridSpacing, ry * gridSpacing,
                    new Random().nextInt(0xffffff));
        }

        for (double y = 0; y < height; y++)
            for (double x = 0; x < width; x++) grid[(int) y][(int) x] = getClosestColor(x / width, y / height);

        System.out.println("done");
    }

    public int getClosestColor(double x, double y) {
        int startX = (int) (x * gridSpacing);
        int startY = (int) (y * gridSpacing);

        Queue<Triplet<Double, Double, Integer>> frontier = new LinkedList<>();

        Triplet<Double, Double, Integer> point;
        double newDist;
        int color = 0;
        double dist = Double.MAX_VALUE;

        frontier.addAll(squares[startX][startY].points);

        while (!frontier.isEmpty()) {
            point = frontier.remove();
            newDist = Math.sqrt(Math.pow((point.x - x), 2) + Math.pow((point.y - y), 2));
            if (newDist < dist) {
                dist = newDist;
                color = point.z;
            }
        }
        return color;
    }

    @Override
    public CoolFrame nextFrame() {
        if (next == null) next = new CoolFrame(width, height, this, numPoints, gridSpacing);
        return (CoolFrame) next;
    }

    class GridSquare {
        Set<Triplet<Double, Double, Integer>> points;

        GridSquare() { points = new HashSet<>(); }

        @Override
        public String toString() { return points.toString(); }

        void addPoint(double x, double y, int color) { points.add(new Triplet<>(x, y, color)); }
    }
}
