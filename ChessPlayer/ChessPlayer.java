package chessplayer;

import java.awt.Color;
import java.awt.Graphics;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import kern.Tools;

public class ChessPlayer {
    Piece selectedPiece;
    boolean isWhite;

    ArrayList<Piece> pieces;

    public ChessPlayer(boolean isWhite, int AILevel) {
        this.isWhite = isWhite;
        selectedPiece = null;
    }

    // this is a lot cleaner and I like it
    public Board selectPosition(int x, int y, Board board) {
        if (!board.inBoard(x, y)) return null;

        Piece newPiece = board.pieceAt(x,y);

        if (newPiece != null && newPiece.isWhite == isWhite) {
            selectedPiece = newPiece;
            return null;
        }

        return selectedPiece != null && board.validMove(selectedPiece, x, y, false) ? board.childBoard(selectedPiece, x, y) : null;
    }

    public void draw(Graphics g, Board board, double chessWidth, double chessHeight) {
        if (selectedPiece != null) {
            double boardWidth = chessWidth / (double) board.width;
            double boardHeight = chessHeight / (double) board.height;

            g.setColor(Color.YELLOW);
            g.fillRect((int) (selectedPiece.x * boardWidth), (int) (selectedPiece.y * boardHeight), (int) (boardWidth) + 1, (int) (boardHeight) + 1);

            g.setColor((selectedPiece.x - selectedPiece.y) % 2 == 0 ? new Color(0xEDC6A6) : new Color(0xA05B23));
            g.fillRect((int) (selectedPiece.x * boardWidth) + Board.SELWIDTH, (int) (selectedPiece.y * boardHeight) + Board.SELWIDTH, (int) (boardWidth) + 1 - 2*Board.SELWIDTH, (int) (boardHeight) + 1 - 2*Board.SELWIDTH);

            //draw piece
            g.setColor(selectedPiece.isWhite ? Color.WHITE : Color.BLACK);
            Tools.drawCenteredString(new String[] {selectedPiece.toString()}, (int) ((selectedPiece.x + 0.5) * boardWidth), (int) ((selectedPiece.y + 0.5) * boardHeight), g);

        }
    }
}