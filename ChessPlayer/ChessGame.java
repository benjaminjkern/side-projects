package chessplayer;

import java.awt.Graphics;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import javax.swing.JFrame;
import kern.Game;

/*
 * Chess game by Ben Kern
 * 
 * I wanted to try this out haha
 * 
 * There are two sets of calculations going on in this: a top down and a bottom up
 * The top down is used for player with arbitrary input gameplay, which just checks to 
 * see 
 * 
 */

public class ChessGame extends Game {

    private static final long serialVersionUID = 1L;
    
    private ChessPlayer currentPlayer, whitePlayer, blackPlayer;
    private Board board;
    private boolean whiteMove;

    public static void main(String[] args) {
        // Run UI in the Event Dispatcher Thread (EDT), instead of Main thread
        javax.swing.SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Chess Game");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            ChessGame game = new ChessGame(640,640);
            frame.setContentPane(game);
            frame.pack();
            frame.setVisible(true);
        });
    }

    //This is here so I can set the board to be whatever I want
    private static String[] startingBoard = {
            "br bn bb bq bk bb bn br",
            "bp bp bp bp bp bp bp bp",
            "",
            "",
            "",
            "",
            "wp wp wp wp wp wp wp wp",
            "wr wn wb wq wk wb wn wr"
    };

    public ChessGame(int width, int height) {
        super(width, height);

        board = new Board(startingBoard, true);
        board.getChildren();

        //white moves first (racist)
        whiteMove = true;
        whitePlayer = new ChessPlayer(true, 0);
        blackPlayer = new ChessPlayer(false, 2);
        
        currentPlayer = whitePlayer;
        paused = false;

        gameStart();
    }
    
    private void pickNewBoard(Board newBoard) {
        if (newBoard != null) {
            board = newBoard;
            board.checkmate();
            whiteMove = !whiteMove;
            currentPlayer = whiteMove ? whitePlayer : blackPlayer;
        }
    }

    public void draw(Graphics g) {
        board.draw(g, width, height);
        currentPlayer.draw(g, board, width, height);
    }

    @Override
    public void mouseClicked(MouseEvent e) {
        int mx = e.getX()/(width/board.width);
        int my = e.getY()/(height/board.height);

        pickNewBoard(currentPlayer.selectPosition(mx, my, board));
    }


    @Override
    public void mousePressed(MouseEvent e) {
        //yeuh
    }


    @Override
    public void mouseReleased(MouseEvent e) {
        //yeuh
    }


    @Override
    public void mouseEntered(MouseEvent e) {
        //yeuh
    }


    @Override
    public void mouseExited(MouseEvent e) {
        //yeuh
    }


    @Override
    public void keyTyped(KeyEvent e) {
        if (e.getKeyChar() == 'a') {
            board = new Board(startingBoard, true);
            board.getChildren();
            currentPlayer = new ChessPlayer(true, 0);
            paused = false;
        }
        if (e.getKeyChar() == ' ') pickNewBoard(currentPlayer.AISelect(board, 1));
    }


    @Override
    public void keyPressed(KeyEvent e) {
        //yeuh
    }


    @Override
    public void keyReleased(KeyEvent e) {
        //yeuh
    }


    @Override
    protected void gameUpdate() {
        pickNewBoard(currentPlayer.AISelect(board));
    }
}
