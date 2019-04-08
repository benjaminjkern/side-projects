package cellularautomata;

import kern.Keyframe;
import kern.Tools;

public class CellularAutomataFrame extends Keyframe {
    private static final boolean STARTRAND = false;
    private double randCount = 0.01;

    CellularAutomataFrame(int width, int height, CellularAutomataFrame parent) {
        super(width, height);
        
        colorMap.put(0, 0x000000);
        colorMap.put(1, CellularAutomata.RANDCOLOR);
        
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                grid[y][x] = parent == null ? ((STARTRAND && Math.random()<randCount)?1:0) : parent.doRule(x,y);
            }
        }
    }
    
    int doRule(int x, int y) {
        // game of life
        int sum1 = boundSum(x,y,1);
        return ((Tools.in(sum1, CellularAutomata.BSET) && test(x,y,0))||(Tools.in(sum1, CellularAutomata.SSET)&&test(x,y,1)))?1:0;
    }
    
    public CellularAutomataFrame next() {
        return new CellularAutomataFrame(width, height, this);
    }
}
