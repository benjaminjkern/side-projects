package kern;

public abstract class Keyframe {

    protected final int[][] grid;
    protected int width, height;

    protected Keyframe next, last;

    public Keyframe(int width, int height, Keyframe parent) {
        this.width = width;
        this.height = height;

        grid = new int[height][width];

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                grid[y][x] = -1;
            }
        }

        next = null;
        last = parent;
    }

    public abstract Keyframe nextFrame();

    public int get(int x, int y) {
        if (x < 0 || y < 0 || x >= width || y >= height)
            return 0;
        return grid[y][x];
    }

    public void set(int x, int y, int c) {
        grid[y][x] = c;
    }
}
