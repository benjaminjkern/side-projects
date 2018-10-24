import java.awt.Graphics;
import java.awt.event.MouseEvent;
import javax.swing.JFrame;

/*
 * Chess game by Ben Kern
 * 
 * I wanted to try this out haha
 * 
 * 
 * 
 */

public class ChessGame extends Game {
    
    public static void main(String[] args) {
        // Run UI in the Event Dispatcher Thread (EDT), instead of Main thread
        javax.swing.SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                JFrame frame = new JFrame("YEUH");
                frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
                ChessGame game = new ChessGame(640,640);
                frame.setContentPane(game);
                frame.pack();
                frame.setVisible(true);
            }
        });
    }
    
    //This is here so I can set the board to be whatever I want
    private String[] startingBoard = {"br bn bb bq bk bb bn br",
                                      "bp bp bp bp bp bp bp bp",
                                      "",
                                      "",
                                      "",
                                      "",
                                      "wp wp wp wp wp wp wp wp",
                                      "wr wn wb wq wk wb wn wr"};
    
    private String[][] makeBoardString(String[] startingBoard) {
        int width = 0;
        
        String[][] newBoardString = new String[startingBoard.length][];
        for (int i=0;i<startingBoard.length;i++) {
            String[] row = startingBoard[i].split(" ");
            if (row.length < width) {
                newBoardString[i] = new String[width];
                for (int r=0;r<row.length;r++) {
                    newBoardString[i][r] = row[r];
                }
            } else {
                newBoardString[i] = row;
            }
            if (newBoardString[i].length > width) {
                width = newBoardString[i].length;
            }
        }
        
        return newBoardString;
    }
    
    public static boolean whiteMove;
    
    public static Board board;

    public ChessGame(int width, int height) {
        super(width, height);
        Game.width = width;
        Game.height = height;
        
        whiteMove = true;
        
        board = new Board(makeBoardString(startingBoard));
        
        gameStart();
    }
    

    public void gameUpdate() {
    }
    
    
    public void draw(Graphics g) {
        super.draw(g);
        board.draw(g);
    }
    
    

    @Override
    public void mouseClicked(MouseEvent e) {
        int mx = e.getX()/(Game.width/board.width);
        int my = e.getY()/(Game.height/board.height);
        board.selectPosition(mx,my, whiteMove);
    }
}
