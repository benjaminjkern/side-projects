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
    
    private ChessPlayer currentPlayer;

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
    private String[] startingBoard = {
            "br bn bb bq bk bb bn br",
            "bp bp bp bp bp bp bp bp",
            "",
            "",
            "",
            "",
            "wp wp wp wp wp wp wp wp",
            "wr wn wb wq wk wb wn wr"
    };

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

    private boolean whiteMove;
    private Board board;

    public ChessGame(int width, int height) {
        super(width, height);

        whiteMove = true;

        board = new Board(makeBoardString(startingBoard));
        currentPlayer = new ChessPlayer(whiteMove);
        
        board.check(whiteMove);

        gameStart();
    }


    public void draw(Graphics g) {
        board.draw(g, width, height, currentPlayer);
    }



    @Override
    public void mouseClicked(MouseEvent e) {
        int mx = e.getX()/(width/board.width());
        int my = e.getY()/(height/board.height());
        if (currentPlayer.selectPosition(mx,my, board)) {
            whiteMove = !whiteMove;
            currentPlayer = new ChessPlayer(whiteMove);
            board.check(whiteMove);
        }
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
        //yeuh
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
        //yeuh
    }
}
