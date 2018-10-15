import javax.swing.JFrame;

public class Main {
    public static void main(String[] args) {
        // Run UI in the Event Dispatcher Thread (EDT), instead of Main thread
        javax.swing.SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                JFrame frame = new JFrame("YEUH");
                frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
                AIFightingGame game = new AIFightingGame(1280,720); // TO ADD: KEYBOARD INPUT AND MOUSE INPUT
                frame.setContentPane(game);
                frame.pack();
                frame.setVisible(true);
            }
        });
    }
}