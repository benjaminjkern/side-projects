public class Ben {
    public static void main(String...s) {
        System.out.println(sqrt(10));
    }

    public static double sqrt(double x) {
        return sqrt(x, 1e-10);
    }

    public static double sqrt(double x, double epsilon) {
        if (x < 0) throw new Exception("Cannot take the square root of a negative number!");
        double a = 0;
        double b = Double.MAX_VALUE;
        while (b - a > epsilon) {
            double c = (b + a) / 2;
            double csquared = c * c;
            if (csquared == x) return c;

            if (csquared > x) b = c;
            else a = c;
        }

        return a;
    }
}