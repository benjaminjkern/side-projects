package kern;

import java.util.HashMap;
import java.util.Map;

public abstract class Keyframe {

    public final int[][] grid;
    public final Map<Integer, Integer> colorMap;
    protected int width, height;
    
    private final int BORDER;

    public Keyframe(int width, int height) {
        this.width = width;
        this.height = height;
        
        grid = new int[height][width];
        
        colorMap = new HashMap<>();
        colorMap.put(0, Animator.DEFAULT_COLOR);

        for (int y=0; y<height; y++) {
            for (int x=0; x<width; x++) {
                grid[y][x] = 0;
            }
        }
        BORDER = 0;
    }
    
    public abstract Keyframe next();
    
    public void set(int x, int y, int c) {
        grid[y][x] = c;
    }
    public int nextInt(int x, int y) {
        return (grid[y][x]+1)%colorMap.size();
    }
    
    public int get(int x, int y) {
        if (x<0 || y < 0 || x >= width || y >= height) return BORDER;
        return grid[y][x];
    }
    
    public boolean test(int x, int y, int goal) {
        return get(x,y)==goal;
    }
    
    public int boundSum(int x, int y, int check) {
        int sum=0;
        for (int i=-1;i<=1;i++) {
            for (int j=-1;j<=1;j++) {
                if (!(i==0 && j==0) && test(x+i,y+j,check)) sum++;
            }
        }
        return sum;
    }
}
