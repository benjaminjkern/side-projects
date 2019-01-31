package kern;

public class Keyframe {

    public int[][] grid;

    Keyframe(int width, int height) {
        grid = new Pixel[height][width];

        for (int y=0; y<height; y++) {
            for (int x=0; x<width; x++) {
                grid[y][x] = Animator.DEFAULT_COLOR;
            }
        }
    }
}
