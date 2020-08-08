package kern;

public class test {

    public static void main(String... strings) {
        while (true) {
            double[] list = Tools.rand(-1000000, 1000000, 4);
            double[] zeros = Tools.findZeros(list);
            System.out.println(Tools.polyEval(list, zeros[0]));
            if (false) break;
        }
    }
}
