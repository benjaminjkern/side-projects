package chessplayer;

import java.util.ArrayList;

public class ChessPlayer {
    Piece selectedPiece;
    boolean isWhite;

    ArrayList<Piece> pieces;

    public ChessPlayer(boolean isWhite) {
        this.isWhite = isWhite;
        selectedPiece = null;
    }

    // this is a lot cleaner and I like it
    public boolean selectPosition(int x, int y, Board board) {
        Piece newPiece = board.checkPiece(x,y);

        if (selectedPiece != null) {
            if (selectedPiece.validMove(x, y, board)) {
                board.movePiece(selectedPiece, x, y);
                if (board.check(isWhite)) {
                    board.moveBack();
                    return false;
                }
                return true;
            }
            if (newPiece != null) {
                if (newPiece.equals(selectedPiece)) selectedPiece = null; // if you select the same piece, unselect it
                if (newPiece.isWhite == isWhite) selectedPiece = newPiece; // if you select a piece of the same color, select new piece
            }
        } else if (newPiece != null && newPiece.isWhite == isWhite) selectedPiece = newPiece;

        return false;
    }
}