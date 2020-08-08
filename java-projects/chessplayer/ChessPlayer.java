package chessplayer;

import java.awt.Color;
import java.awt.Graphics;
import java.util.ArrayList;
import java.util.Random;

import kern.Tools;

public class ChessPlayer {
    private Piece selectedPiece;
    private boolean isWhite;
    private int AILevel;

    ArrayList<Piece> pieces;

    public ChessPlayer(boolean isWhite, int AILevel) {
        this.isWhite = isWhite;
        selectedPiece = null;
        this.AILevel = AILevel;
    }

    //I hate how this is implemented rn but I havent had time to sit down and focus on it
    public Board AISelect(Board board) {
        return board.getChildren().isEmpty() || AILevel == 0 ? null : AISelect(board, AILevel);
    }
    
    public Board AISelect(Board board, int level) {
        if (level == 0) return board;
        
        ArrayList<Board> children = board.getChildren();
        if (children.isEmpty()) return null;
        
        ArrayList<Board> bestBoards = new ArrayList<>();
        for (Board child : children) {
            int score = AISelect(child, level - 1).score();
            
            if (!bestBoards.isEmpty() && score > bestBoards.get(0).score()) bestBoards = new ArrayList<>();
            if (bestBoards.isEmpty() || score >= bestBoards.get(0).score()) bestBoards.add(child);
        }
        return bestBoards.get(new Random().nextInt(bestBoards.size()));
    }

    // manual selection
    public Board selectPosition(int x, int y, Board board) {
        if (!board.inBoard(x, y)) return null;

        Piece newPiece = board.pieceAt(x,y);

        if (newPiece != null && newPiece.isWhite == isWhite) {
            selectedPiece = newPiece;
            return null;
        }

        Board newBoard = board.validMove(selectedPiece, x, y, false);
        selectedPiece = null;
        return newBoard;
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