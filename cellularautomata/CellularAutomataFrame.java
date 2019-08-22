package cellularautomata;

import java.util.Map;
import java.util.Map.Entry;
import java.util.AbstractMap.SimpleEntry;

import kern.Keyframe;

public class CellularAutomataFrame extends Keyframe {
    private static final boolean STARTRAND = false;
    private double randCount = 0.01;
    
    // border properties (Really only useful in the case of cellular automata, idk why its in this class)
    private final int border;
    Map<Entry<Integer, Integer>, Integer> ruleSet;

    CellularAutomataFrame(int width, int height, CellularAutomataFrame parent, Map<Entry<Integer, Integer>, Integer> ruleSet) {
        super(width, height, parent);
        
        this.ruleSet = ruleSet;
        
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                grid[y][x] = parent == null ? ((STARTRAND && Math.random()<randCount)?1:0) : parent.doRule(x,y, ruleSet);
            }
        }
        border = 0;
    }
    
    int doRule(int x, int y, Map<Entry<Integer, Integer>, Integer> ruleSet) {
    	int sum = 0;
    	for (int c=0;c<=CellularAutomata.COLORS;c++) {
    		sum += boundSum(x,y,c)*Math.pow(9, c);
    	}
    	Entry<Integer, Integer> entry = new SimpleEntry<>(get(x,y), sum);
    	int nigga = 0;
    	try {
    		nigga = ruleSet.get(entry);
    	} catch (NullPointerException e) {
    		System.out.println(entry);
    	}
        return nigga;
    }
    
    public CellularAutomataFrame nextFrame() {
    	next = new CellularAutomataFrame(width, height, this, ruleSet);
    	ruleSet = null;
        return (CellularAutomataFrame) next;
    }
    
    public int get(int x, int y) {
        if (x<0 || y < 0 || x >= width || y >= height) return border;
        return grid[y][x];
    }
    
    // test if a specific pixel is what you're looking for
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
