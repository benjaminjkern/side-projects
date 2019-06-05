package threed;

import java.awt.Color;
import java.awt.Graphics;
import java.util.ArrayList;
import java.util.List;
import java.util.PriorityQueue;
import java.util.Queue;

import kern.Tools;

public class Object3D {
    
    public List<Object3D> objectsToDraw;
    public double[] pos;
    
    public Object3D() {
        pos = new double[] {0,0,0};
        objectsToDraw = new ArrayList<>();
    }
    
    public Object3D(double[] pos) {
        this.pos = pos;
        objectsToDraw = new ArrayList<>();
    }
    
    public void draw(Graphics g, LineObject camera, double FOV, double stageWidth, double stageHeight) {
        for (Object3D o: objectsToDraw) o.draw(g, camera, FOV, stageWidth, stageHeight);
    }
    
    public void add(Object3D object) {
        object.translate(pos);
        objectsToDraw.add(object);
    }
    
    /*
     * for manipulating the current object
     * 
     */
    
    public void rotate(double[] u, double angle) {
        double c = Math.cos(angle); double s = Math.sin(angle);
        double[][] R = new double[][] {
            new double[] {c + u[0]*u[0]*(1-c), -u[2]*s + u[0]*u[1]*(1-c), u[1]*s + u[0]*u[2]*(1-c)},
            new double[] {u[2]*s + u[0]*u[1]*(1-c), c + u[1]*u[1]*(1-c), -u[0]*s + u[1]*u[2]*(1-c)},
            new double[] {-u[1]*s + u[0]*u[2]*(1-c), u[0]*s + u[1]*u[2]*(1-c), c + u[2]*u[2]*(1-c)}
        };
        
        for (Object3D o: objectsToDraw) o.rotate(R, pos);
    }
    
    public void rotate(double[][] R, double[] root) {
        for (Object3D o: objectsToDraw) o.rotate(R, root);
    }
    
    public void translate(double[] diff) {
        pos = Tools.add(pos, diff);
        for (Object3D o: objectsToDraw) o.translate(diff);
    }
    
    public void moveTo(double[] pos) {
        for (Object3D o: objectsToDraw) o.translate(Tools.subtract(pos, this.pos));
        this.pos = pos;
    }
    
    
    /*
     * Construct different shapes!
     * 
     */
    
    
    public static Object3D cubeObject(Color color, double[] pos, double x, double y, double z) {
        Object3D cube = new Object3D(pos);
        cube.add(new LineObject(color, new double[] {}, new double[] {}));
        return cube;
    }
    
    public static Object3D sphereObject(Color color, double radius, int iMax, int jMax) {
        return sphereObject(color, new double[] {0,0,0}, radius, iMax, jMax);
    }
    
    public static Object3D sphereObject(Color color, double[] pos, double radius, int iMax, int jMax) {
        Object3D sphere = new Object3D(pos);
        for (double i = 0; i < iMax; i++) {
            for (double j = 0; j < jMax; j++) {
                sphere.add(new LineObject(color, Tools.mult(radius, new double[] {Math.sin(i/iMax*Math.PI)*Math.cos(j/jMax*Math.PI*2), Math.sin(i/iMax*Math.PI)*Math.sin(j/jMax*Math.PI*2), Math.cos(i/iMax*Math.PI)}),
                        Tools.mult(radius, new double[] {Math.sin((i+1)/iMax*Math.PI)*Math.cos(j/jMax*Math.PI*2), Math.sin((i+1)/iMax*Math.PI)*Math.sin(j/jMax*Math.PI*2), Math.cos((i+1)/iMax*Math.PI)})));
                sphere.add(new LineObject(color, Tools.mult(radius, new double[] {Math.sin(i/iMax*Math.PI)*Math.cos(j/jMax*Math.PI*2), Math.sin(i/iMax*Math.PI)*Math.sin(j/jMax*Math.PI*2), Math.cos(i/iMax*Math.PI)}),
                        Tools.mult(radius, new double[] {Math.sin(i/iMax*Math.PI)*Math.cos((j+1)/jMax*Math.PI*2), Math.sin(i/iMax*Math.PI)*Math.sin((j+1)/jMax*Math.PI*2), Math.cos(i/iMax*Math.PI)})));
            }
        }
        
        return sphere;
    }
    
    //Turn the current arrayList into a list of pane objects(For rendering faces)
    public void getPanes() {
        
    }
}