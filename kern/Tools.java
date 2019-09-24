package kern;

import java.awt.FontMetrics;
import java.awt.Graphics;

public class Tools {

    // THE FOLLOWING ARE JUST THINGS THAT ARE USEFUL

    public static double getDist(double x1, double x2, double y1, double y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    public static String print(int[] array) {
        StringBuilder print = new StringBuilder("[" + array[0]);

        for (int a = 1; a < array.length; a++) {
            print.append(", " + array[a]);
        }

        print.append("]");

        return print.toString();
    }

    public static String print(double[] array) {
        StringBuilder print = new StringBuilder("[" + Math.round(array[0] * 100) / 100.);

        for (int a = 1; a < array.length; a++) {
            print.append(", " + Math.round(array[a] * 100) / 100.);
        }

        print.append("]");

        return print.toString();
    }

    public static String print(Object[] array) {
        StringBuilder print = new StringBuilder("[" + array[0].toString());

        for (int a = 1; a < array.length; a++) {
            print.append(", " + array[a].toString());
        }

        print.append("]");

        return print.toString();
    }

    public static String print(double[][] array) {
        StringBuilder print = new StringBuilder("[" + print(array[0]));

        for (int a = 1; a < array.length; a++) {
            print.append(", " + print(array[a]));
        }

        print.append("]");

        return print.toString();
    }

    public static String print(int[][] array) {
        StringBuilder print = new StringBuilder("[" + print(array[0]));

        for (int a = 1; a < array.length; a++) {
            print.append(", " + print(array[a]));
        }

        print.append("]");

        return print.toString();
    }

    public static void println(double[] a) {
        System.out.println(print(a));
    }

    public static void println(double[][] a) {
        System.out.println(print(a));
    }

    public static void println(int[][] a) {
        System.out.println(print(a));
    }

    public static void println(int[] a) {
        System.out.println(print(a));
    }

    // these are super redundant but I hate having to type System.out.println

    public static void println(double a) {
        System.out.println(a);
    }

    public static void println(int a) {
        System.out.println(a);
    }

    public static void println(String a) {
        System.out.println(a);
    }

    // THIS IS IMMENSELY USEFUL CUZ THE DEFAULT JAVA LIBRARY SUCKS
    public static void drawCenteredString(String[] s, int x, int y, Graphics g) {
        FontMetrics fm = g.getFontMetrics();
        double lineHeight = (fm.getAscent() - fm.getDescent());
        for (int n = 0; n < s.length; n++) {
            double newX = x - (fm.stringWidth(s[n])) / 2.;
            double newY = y + lineHeight * (2 * (1 + n) - s.length);
            g.drawString(s[n], (int) newX, (int) newY);
        }
    }

    // Stolen and edited from C# code on a wikipedia page, if you can believe it
    public static double[] solveUsingLU(double[][] matrix, double[] rightPart) {
        // I could change this to work on non-square matrices but it doesne matter for
        // nigh

        int n = rightPart.length;

        // decomposition of matrix
        double[][] lu = new double[n][n];
        double sum = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                sum = 0;
                for (int k = 0; k < i; k++) sum += lu[i][k] * lu[k][j];
                lu[i][j] = matrix[i][j] - sum;
            }
            for (int j = i + 1; j < n; j++) {
                sum = 0;
                for (int k = 0; k < i; k++) sum += lu[j][k] * lu[k][i];
                lu[j][i] = (1 / lu[i][i]) * (matrix[j][i] - sum);
            }
        }

        // lu = L+U-I
        // find solution of Ly = b
        double[] y = new double[n];
        for (int i = 0; i < n; i++) {
            sum = 0;
            for (int k = 0; k < i; k++) sum += lu[i][k] * y[k];
            y[i] = rightPart[i] - sum;
        }
        // find solution of Ux = y
        double[] x = new double[n];
        for (int i = n - 1; i >= 0; i--) {
            sum = 0;
            for (int k = i + 1; k < n; k++) sum += lu[i][k] * x[k];
            x[i] = (1 / lu[i][i]) * (y[i] - sum);
        }
        return x;
    }

    // I love that that worked.

    public static int round(double a) {
        return (int) Math.round(a);
    }

    public static int[] round(double[] a) {
        int[] output = new int[a.length];
        for (int o = 0; o < a.length; o++) {
            output[o] = round(a[o]);
        }
        return output;
    }

    public static int[][] round(double[][] a) {
        int[][] output = new int[a.length][];
        for (int o = 0; o < a.length; o++) {
            output[o] = round(a[o]);
        }
        return output;
    }

    public static int floor(double a) {
        return (int) a;
    }

    public static int[] floor(double[] a) {
        int[] output = new int[a.length];
        for (int o = 0; o < a.length; o++) {
            output[o] = floor(a[o]);
        }
        return output;
    }

    public static int[][] floor(double[][] a) {
        int[][] output = new int[a.length][];
        for (int o = 0; o < a.length; o++) {
            output[o] = floor(a[o]);
        }
        return output;
    }

    // return sign of a number (overloaded for vectors and matrices)
    // this can probably be reduced using lambda calculus or something hahaha
    public static int sgn(double a) {
        return Math.abs(a) < 1e-12 ? 0 : (int) Math.round(a / Math.abs(a));
    }

    public static int[] sgn(double[] a) {
        int[] output = new int[a.length];

        for (int i = 0; i < a.length; i++) {
            output[i] = sgn(a[i]);
        }
        return output;
    }

    public static int[][] sgn(double[][] a) {
        int[][] output = new int[a.length][a[0].length];

        for (int y = 0; y < a.length; y++) {
            output[y] = sgn(a[y]);
        }
        return output;
    }

    public static int sgn(int a) {
        return sgn((double) a);
    }

    public static int[] sgn(int[] a) {
        return sgn(a);
    }

    public static int[][] sgn(int[][] a) {
        return sgn(a);
    }

    // sigmoid function
    public static double sigmoid(double a) {
        return 1. / (1 + Math.exp(-a));
    }

    public static double[] sigmoid(double[] a) {
        double[] output = new double[a.length];

        for (int i = 0; i < a.length; i++) {
            output[i] = sigmoid(a[i]);
        }
        return output;
    }

    public static double[][] sigmoid(double[][] a) {
        double[][] output = new double[a.length][a[0].length];

        for (int y = 0; y < a.length; y++) {
            output[y] = sigmoid(a[y]);
        }
        return output;
    }

    // ReLU function (overloaded, I wanna fix this by this point lol)
    public static double ReLU(double a) {
        return a < 0 ? 0 : a;
    }

    public static double[] ReLU(double[] a) {
        double[] output = new double[a.length];

        for (int i = 0; i < a.length; i++) {
            output[i] = ReLU(a[i]);
        }
        return output;
    }

    public static double[][] ReLU(double[][] a) {
        double[][] output = new double[a.length][a[0].length];

        for (int y = 0; y < a.length; y++) {
            output[y] = ReLU(a[y]);
        }
        return output;
    }

    // creats a random number between two nums, overloaded for vectors and matrices
    public static double rand(double low, double high) {
        return Math.random() * (high - low) + low;
    }

    public static double[] rand(double low, double high, int lengthOfVector) {
        double[] output = new double[lengthOfVector];

        for (int i = 0; i < lengthOfVector; i++) {
            output[i] = rand(low, high);
        }
        return output;
    }

    public static double[][] rand(double low, double high, int height, int width) {
        double[][] output = new double[height][width];

        for (int y = 0; y < height; y++) {
            output[y] = rand(low, high, width);
        }
        return output;
    }

    public static double min(double[] a) {
        double currentMin = Double.MAX_VALUE;

        for (int i = 0; i < a.length; i++) {
            if (a[i] < currentMin) {
                currentMin = a[i];
            }
        }
        return currentMin;
    }

    public static int minPos(double[] a) {
        double currentMin = Double.MAX_VALUE;
        int currentPos = 0;

        for (int i = 0; i < a.length; i++) {
            if (a[i] < currentMin) {
                currentMin = a[i];
                currentPos = i;
            }
        }
        return currentPos;
    }

    public static double max(double[] a) {
        double currentMax = Double.MIN_VALUE;

        for (int i = 0; i < a.length; i++) {
            if (a[i] < currentMax) {
                currentMax = a[i];
            }
        }
        return currentMax;
    }

    public static int maxPos(double[] a) {
        double currentMax = Double.MIN_VALUE;
        int currentPos = 0;

        for (int i = 0; i < a.length; i++) {
            if (a[i] < currentMax) {
                currentMax = a[i];
                currentPos = i;
            }
        }
        return currentPos;
    }

    // zeros (I'm stealing from Matlab at this point hahaha its okay though I like
    // matlab better but hey if I have something cool like this then maybe I'll like
    // using Java better
    public static double[] zeros(int length) {
        double[] output = new double[length];

        for (int i = 0; i < length; i++) {
            output[i] = 0;
        }
        return output;
    }

    public static double[][] zeros(int height, int width) {
        double[][] output = new double[height][width];

        for (int y = 0; y < height; y++) {
            output[y] = zeros(width);
        }
        return output;
    }

    // average of a vector, overloaded for matrices
    public static double sum(double[] a) {
        double sum = 0;

        for (int i = 0; i < a.length; i++) {
            sum += a[i];
        }
        return sum;
    }

    public static double sum(double[][] a) {
        double output = 0;

        for (int y = 0; y < a.length; y++) {
            output += sum(a[y]);
        }
        return output;
    }

    public static double[] sum(double[][] a, int dim) {
        if (dim == 0) {
            double[] output = new double[a.length];
            for (int y = 0; y < a.length; y++) {
                output[y] = sum(a[y]);
            }
            return output;
        } else if (dim == 1) {
            return sum(transpose(a), 0);
        }

        throw new IllegalArgumentException();
    }

    // average!
    public static double average(double[] a) {
        return sum(a) / a.length;
    }

    public static double average(double[][] a) {
        return sum(a) / (a.length * a[0].length);
    }

    public static double[] average(double[][] a, int dim) {
        return mult(sum(a, dim), 1 / (double) (dim == 0 ? a[0].length : a.length));
    }

    // make a copy of things!

    public static double[] makeCopy(double[] a) {
        double[] output = new double[a.length];

        for (int y = 0; y < a.length; y++) {
            output[y] = a[y];
        }
        return output;
    }

    public static double[][] makeCopy(double[][] a) {
        double[][] output = new double[a.length][a[0].length];

        for (int y = 0; y < a.length; y++) {
            output[y] = makeCopy(a[y]);
        }
        return output;
    }

    public static double[] cPow(double[] a, double b) {
        double[] output = new double[a.length];

        for (int i = 0; i < a.length; i++) {
            output[i] = Math.pow(a[i], b);
        }

        return output;
    }

    public static double[] cPow(double a, double[] b) {
        return cPow(b, a);
    }

    public static double[] pow(double[] a, double b) {
        return cPow(a, b);
    }

    public static double[] pow(double a, double[] b) {
        return cPow(a, b);
    }

    public static double[][] cPow(double[][] a, double b) {
        double[][] output = new double[a.length][a[0].length];

        for (int i = 0; i < a.length; i++) {
            output[i] = cPow(a[i], b);
        }

        return output;
    }

    public static double[][] cPow(double a, double[][] b) {
        return cPow(b, a);
    }

    public static double[][] cPow(double[][] a, double[] b) {
        throw new UnsupportedOperationException();
    }

    // LINEAR ALGEBRA

    // cast stuff as matrix (shown as public but ideally would only be used
    // privately)
    public static double[] vector(int[] a) {
        double[] vec = new double[a.length];

        for (int i = 0; i < a.length; i++) {
            vec[i] = a[i];
        }
        return vec;
    }

    public static double[][] matrix(int[][] a) {
        double[][] mat = new double[a.length][1];

        for (int i = 0; i < a.length; i++) {
            mat[i] = vector(a[i]);
        }
        return mat;
    }

    public static double[][] matrix(double[] a) {
        double[][] mat = new double[a.length][1];

        for (int i = 0; i < a.length; i++) {
            mat[i][0] = a[i];
        }
        return mat;
    }

    public static double[][] matrix(double a) {
        double[][] mat = new double[1][1];
        mat[0][0] = a;
        return mat;
    }

    // cast down to a vector or single number
    public static double[] cast2vect(double[][] a) {
        if (a.length == 1) {
            double[] output = new double[a[0].length];

            for (int i = 0; i < a[0].length; i++) {
                output[i] = a[0][i];
            }
            return output;
        } else if (a[0].length == 1) return cast2vect(transpose(a));

        throw new ImproperDimensionException(a);
    }

    public static double cast2num(double[][] a) {
        if (a.length == 1 && a[0].length == 1) return a[0][0];
        throw new ImproperDimensionException(a);
    }

    public static double[] unitVector(double[] a) {
        double s = Math.sqrt(sum(cPow(a, 2)));
        if (s == 0) return a;
        return mult(a, 1 / s);
    }

    // I'm kinda inconsistent here as to whether my statements return null or an
    // Error upon error, also whether this error management is done at the beginning
    // or the end, I should fix that at some point
    public static double add(double a, double b) {
        // lol
        return a + b;
    }

    public static double[] add(double[] a, double b) {
        double[] output = new double[a.length];

        for (int i = 0; i < a.length; i++) {
            output[i] = a[i] + b;
        }
        return output;
    }

    public static double[] add(double a, double[] b) {
        return add(b, a);
    }

    public static double[] add(double[] a, double[] b) {
        if (a.length != b.length) throw new ImproperDimensionException(a, b);

        double[] output = new double[a.length];

        for (int i = 0; i < a.length; i++) {
            output[i] = a[i] + b[i];
        }
        return output;
    }

    public static double[][] add(double[][] a, double b) {
        double[][] output = new double[a.length][a[0].length];

        for (int y = 0; y < a.length; y++) {
            output[y] = add(a[y], b);
        }
        return output;
    }

    public static double[][] add(double a, double[][] b) {
        return add(b, a);
    }

    public static double[][] add(double[][] a, double[][] b) {
        if (a.length != b.length || a[0].length != b[0].length) throw new ImproperDimensionException(a, b);

        double[][] output = new double[a.length][a[0].length];

        for (int y = 0; y < a.length; y++) {
            output[y] = add(a[y], b[y]);
        }
        return output;
    }

    public static double subtract(double a, double b) {
        return a - b;
    }

    public static double[] subtract(double[] a, double b) {
        return add(a, -b);
    }

    public static double[] subtract(double a, double[] b) {
        return add(a, mult(-1, b));
    }

    public static double[] subtract(double[] a, double[] b) {
        return add(a, mult(-1, b));
    }

    public static double[][] subtract(double[][] a, double b) {
        return add(a, -b);
    }

    public static double[][] subtract(double a, double[][] b) {
        return add(a, mult(-1, b));
    }

    public static double[][] subtract(double[][] a, double[][] b) {
        return add(a, mult(-1, b));
    }

    public static double cMult(double a, double b) {
        // lol
        return a * b;
    }

    public static double[] cMult(double[] a, double b) {
        return mult(a, b);
    }

    public static double[] cMult(double a, double[] b) {
        return mult(a, b);
    }

    public static double[] cMult(double[] a, double[] b) {
        if (a.length != b.length) throw new ImproperDimensionException(a, b);

        double[] output = new double[a.length];

        for (int i = 0; i < a.length; i++) {
            output[i] = a[i] * b[i];
        }
        return output;
    }

    public static double[][] cMult(double[][] a, double b) {
        return mult(a, b);
    }

    public static double[][] cMult(double a, double[][] b) {
        return mult(a, b);
    }

    public static double[][] cMult(double[][] a, double[] b) {
        if (a[0].length == b.length) {
            double[][] output = new double[a.length][a[0].length];

            for (int y = 0; y < a.length; y++) {
                output[y] = cMult(a[y], b);
            }
            return output;
        } else if (a.length == b.length) {
            return transpose(cMult(transpose(a), b));
        }

        throw new ImproperDimensionException(a, b);
    }

    public static double[][] cMult(double[] a, double[][] b) {
        return cMult(b, a);
    }

    public static double[][] cMult(double[][] a, double[][] b) {
        if (a.length != b.length || a[0].length != b[0].length) throw new ImproperDimensionException(a, b);

        double[][] output = new double[a.length][a[0].length];

        for (int y = 0; y < a.length; y++) {
            output[y] = cMult(a[y], b[y]);
        }
        return output;
    }

    public static double mult(double a, double b) {
        // this is redundant but hey I felt like putting it in just so there are less
        // possible errors
        return a * b;
    }

    public static double[] mult(double[] a, double b) {
        double[] output = new double[a.length];

        for (int i = 0; i < a.length; i++) {
            output[i] = a[i] * b;
        }

        return output;
    }

    public static double[] mult(double a, double[] b) {
        return mult(b, a);
    }

    // vector x vector depends on how you want to do it!
    public static double[] mult(double[] a, double[] b) {
        return cMult(a, b);
    }

    /*
     * mult(a, b,
     */
    public static double[][] mult(double[][] a, double b) {
        double[][] output = new double[a.length][a[0].length];

        for (int y = 0; y < a.length; y++) {
            output[y] = mult(a[y], b);
        }
        return output;
    }

    public static double[][] mult(double a, double[][] b) {
        return mult(b, a);
    }

    public static double[] mult(double[] a, double[][] b) {
        if (a.length != b.length) throw new ImproperDimensionException(a, b);

        double[] output = new double[b[0].length];

        for (int i = 0; i < b[0].length; i++) {
            output[i] = dotProduct(a, transpose(b)[i]);
        }
        return output;
    }

    public static double[] mult(double[][] a, double[] b) {
        if (a[0].length != b.length) throw new ImproperDimensionException(a, b);

        double[] output = new double[a.length];
        for (int i = 0; i < a.length; i++) {
            output[i] = dotProduct(a[i], b);
        }
        return output;
    }

    public static double[][] mult(double[][] a, double[][] b) {
        // defaults to outerproduct multiplication (slightly faster if using
        // parallellized computation)

        return mult(a, b, true);
    }

    public static double[][] mult(double[][] a, double[][] b, boolean innerOuter) {
        if (a[0].length != b.length) throw new ImproperDimensionException(a, b);

        double[][] output = zeros(a[0].length, b.length);

        if (innerOuter) {
            for (int y = 0; y < a.length; y++) {
                output[y] = mult(a[y], b);
            }
        } else {
            for (int i = 0; i < b.length; i++) {
                output = add(output, outerProduct(transpose(a)[i], b[i]));
            }
        }
        return output;
    }

    public static double dotProduct(double[] a, double[] b) {
        if (a.length != b.length) throw new ImproperDimensionException(a, b);

        double output = 0;

        for (int i = 0; i < a.length; i++) {
            output += a[i] * b[i];
        }
        return output;
    }

    public static double[] wedgeProduct(double[] a, double[] b) {
        throw new UnsupportedOperationException();
    }

    public static double innerProduct(double[] a, double[] b) {
        return dotProduct(a, b);
    }

    public static double[][] outerProduct(double[] a, double[] b) {
        double[][] output = new double[a.length][b.length];

        for (int y = 0; y < a.length; y++) {
            for (int x = 0; x < b.length; x++) {
                output[y][x] = a[y] * b[x];
            }
        }
        return output;
    }

    public static double det(double[][] a) {
        throw new UnsupportedOperationException();
    }

    public static double[][] inverse(double[][] a) {
        throw new UnsupportedOperationException();
    }

    // this isnt idealized because of Java
    public static double[][] slice(double[][] a, int y1, int y2, int x1, int x2) {
        if (y1 == -1) y1 = 0;
        if (y2 == -1) y2 = a.length;
        if (x1 == -1) x1 = 0;
        if (x2 == -1) x2 = a[0].length;

        double[][] output = new double[y2 - y1 + 1][x2 - x1 + 1];

        for (int y = y1; y < y2; y++) {
            for (int x = x1; x < x2; x++) {
                output[y - y1][x - x1] = a[y][x];
            }
        }
        return output;
    }

    public static double[][] cut(double[][] a, int y1, int y2, int x1, int x2) {
        throw new UnsupportedOperationException(); // TODO: do this shit
    }

    /*
     * concat(a, b, [dim])
     * 
     * Concatenates matrix, vector, or number a and with matrix, vector, or number b
     * together in the dimension specified.
     * 
     * - If dim is not specified it tries to guess dimension by looking at the sizes
     * of a and b. - If a and b are vectors and dim is not specified, it defaults to
     * stacking them on top of each other in to one vector.
     * 
     */
    public static double[][] concat(double[][] a, double[][] b, int dim) {
        if (dim == 0) {
            if (a[0].length == b[0].length) {
                double[][] output = new double[a.length + b.length][a[0].length];
                for (int o = 0; o < a.length; o++) {
                    output[o] = makeCopy(a[o]);
                }
                for (int o = a.length; o < a.length + b.length; o++) {
                    output[o] = makeCopy(b[o]);
                }

                return output;
            }

            throw new ImproperDimensionException(a, b);
        } else if (dim == 1) return transpose(concat(transpose(a), transpose(b), 0));

        throw new IllegalArgumentException();
    }

    public static double[][] concat(double[][] a, double[][] b) {
        if (a.length != b.length && a[0].length == b[0].length) return concat(a, b, 0);
        else if (a.length == b.length && a[0].length != b[0].length) return concat(a, b, 1);

        throw new ImproperDimensionException(a, b);
    }

    public static double[][] concat(double[][] a, double[] b, int dim) {
        if (dim == 0) {
            if (a.length == 0) return transpose(b);
            if (a[0].length == b.length) {
                double[][] output = new double[a.length + 1][a[0].length];
                for (int o = 0; o < a.length; o++) output[o] = makeCopy(a[o]);

                output[a.length] = makeCopy(b);

                return output;
            }
        } else if (dim == 1) return transpose(concat(transpose(a), b, 0));

        println(a);
        println(b);
        throw new IllegalArgumentException();
    }

    public static double[][] concat(double[][] a, double[] b) {
        if (a.length != b.length && a[0].length == b.length) return concat(a, b, 0);
        else if (a.length == b.length && a[0].length != b.length) return concat(a, b, 1);

        throw new ImproperDimensionException(a, b);
    }

    public static double[][] concat(double[] a, double[][] b, int dim) {
        return flip(concat(flip(b, dim), a), dim);
    }

    public static double[][] concat(double[] a, double[][] b) {
        if (a.length != b.length && a.length == b[0].length) return concat(a, b, 0);
        else if (a.length == b.length && a.length != b[0].length) return concat(a, b, 1);

        throw new ImproperDimensionException(a, b);
    }

    public static double[][] concat(double[] a, double[] b, int dim) {
        if (dim == 0) {
            return matrix(concat(a, b));
        } else if (dim == 1) {
            if (a.length == b.length) {
                double[][] output = new double[a.length][2];
                for (int o = 0; o < a.length; o++) {
                    output[o] = concat(a[o], b[o]);
                }

                return output;
            }

            throw new ImproperDimensionException(a, b);
        }

        throw new IllegalArgumentException();
    }

    public static double[] concat(double[] a, double[] b) {
        double[] output = new double[a.length + b.length];
        for (int o = 0; o < a.length; o++) {
            output[o] = a[o];
        }
        for (int o = a.length; o < a.length + b.length; o++) {
            output[o] = b[o];
        }

        return output;
    }

    public static double[] concat(double[] a, double b) {
        double[] output = new double[a.length + 1];
        for (int o = 0; o < a.length; o++) {
            output[o] = a[o];
        }

        output[a.length] = b;

        return output;
    }

    public static double[] concat(double a, double[] b) {
        return flip(concat(flip(b), a));
    } // might not be super fast but its okay

    public static double[] concat(double a, double b) {
        return new double[] { a, b };
    } // redundant but hey thats what I'm going for

    public static double magnitude(double a) {
        return Math.abs(a);
    }

    public static double magnitude(double[] a) {
        double output = 0;
        for (int i = 0; i < a.length; i++) {
            output += a[i] * a[i];
        }

        return Math.sqrt(output);
    }

    public static double[] magnitude(double[][] a) {
        double output[] = new double[a.length];

        for (int i = 0; i < a.length; i++) {
            output[i] = magnitude(a[i]);
        }
        return output;
    }

    public static double[] project(double[] a, double[] b) {
        return mult(dotProduct(a, b) / dotProduct(b, b), b);
    }

    public static double[][] rotateMat(double angle) {
        return new double[][] { new double[] { Math.cos(angle), -Math.sin(angle) },
                new double[] { Math.sin(angle), Math.cos(angle) } };
    }

    /*
     * flip(a, [dim])
     * 
     * Returns a flipped form of the given matrix or vector a along the axis dim
     * 
     * - dim is not to be specified for a vector, must be specified for a matrix.
     * 
     */
    public static double[] flip(double[] a) {
        double[] output = new double[a.length];
        for (int o = 0; o < a.length; o++) {
            output[o] = a[a.length - o - 1];
        }

        return output;
    }

    public static double[][] flip(double[][] a, int dim) {
        if (dim == 1) {
            double[][] output = new double[a[0].length][];
            for (int o = 0; o < a.length; o++) {
                output[o] = flip(a[a.length - o - 1]);
            }

            return output;
        } else if (dim == 0) return transpose(flip(transpose(a), 1));

        throw new IllegalArgumentException();
    }

    /*
     * transpose(a)
     * 
     * Returns the transpose of matrix a.
     * 
     * - If a is a vector, it is taken to be a column vector and returned as a
     * horizontal vector-matrix.
     * 
     */
    public static double[][] transpose(double[][] a) {
        double[][] mat = new double[a[0].length][a.length];

        for (int i = 0; i < a.length; i++) {
            for (int j = 0; j < a[0].length; j++) {
                mat[j][i] = a[i][j];
            }
        }
        return mat;
    }

    public static double[][] transpose(double[] a) {
        return new double[][] { makeCopy(a) };
    }

    public static double[] sort(double[] a) {
        double[] output = makeCopy(a);
        double t;
        for (int i = 0; i < output.length; i++) {
            for (int j = i + 1; j < output.length; j++) {
                if (output[j] > output[i]) {
                    t = output[i];
                    output[i] = output[j];
                    output[j] = t;
                }
            }
        }

        return output;
    }

    public static boolean in(double a, double[] b) {
        for (int i = 0; i < b.length; i++) {
            if (a == b[i]) return true;
        }
        return false;
    }

    public static boolean in(int a, int[] b) {
        for (int i = 0; i < b.length; i++) {
            if (a == b[i]) return true;
        }
        return false;
    }

    public static double[] concatenate(double... ds) {
        return ds;
    }

    public static double[][] concatenate(double[]... ds) {
        return ds;
    }

    public static double[] crossProduct(double[] a, double[] b) {
        if (a.length != 3 || b.length != 3) throw new IllegalArgumentException();
        return new double[] { a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] };
    }
}

class ImproperDimensionException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private static final String BASIC = "Improper Dimension Size(s)";

    // Parameterless Constructor
    public ImproperDimensionException() {
        super(BASIC);
    }

    // Constructor that accepts a message
    public ImproperDimensionException(String message) {
        super(BASIC + message);
    }

    // Constructor that accepts number(s)
    public ImproperDimensionException(double[] a) {
        super(BASIC + " a: " + a.length);
    }

    // Constructor that accepts number(s)
    public ImproperDimensionException(double[][] a) {
        super(BASIC + " a: [" + a.length + ", " + (a.length == 0 ? 0 : a[0].length) + "]");
    }

    // Constructor that accepts number(s)
    public ImproperDimensionException(double[] a, double[] b) {
        super(BASIC + " a: " + a.length + ", b: " + b.length);
    }

    // Constructor that accepts number(s)
    public ImproperDimensionException(double[] a, double[][] b) {
        super(BASIC + " a: " + a.length + ", b: [" + b.length + ", " + (b.length == 0 ? 0 : b[0].length) + "]");
    }

    // Constructor that accepts number(s)
    public ImproperDimensionException(double[][] a, double[] b) {
        super(BASIC + " a: [" + a.length + ", " + (a.length == 0 ? 0 : a[0].length) + "], b: " + b.length);
    }

    // Constructor that accepts number(s)
    public ImproperDimensionException(double[][] a, double[][] b) {
        super(BASIC + " a: [" + a.length + ", " + (a.length == 0 ? 0 : a[0].length) + "], b: [" + b.length + ", "
                + (b.length == 0 ? 0 : b[0].length) + "]");
    }
}
