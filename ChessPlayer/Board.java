package chessplayer;

// THIS IS THE STATE / NODE

import java.awt.Color;
import java.awt.Graphics;
import java.util.ArrayList;
import kern.Tools;

public class Board {

    //width of selected square boundary box for animation
    public static final int SELWIDTH = 10;

    private Piece[][] pieceBoard;

    private ArrayList<Piece> whitePieces;
    private ArrayList<Piece> blackPieces;

    private Board parent;

    private int width, height;
    public int width() {return width;}
    public int height() {return height;}

    public Board(String[][] stringBoard) {
        whitePieces = new ArrayList<>();
        blackPieces = new ArrayList<>();

        height = stringBoard.length;
        width = stringBoard[0].length;
        pieceBoard = new Piece[height][width];
        parent = null;

        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j++) {
                try {
                    pieceBoard[i][j] = new Piece(stringBoard[i][j]);

                    if (pieceBoard[i][j].isWhite) whitePieces.add(pieceBoard[i][j]);
                    else blackPieces.add(pieceBoard[i][j]);
                    pieceBoard[i][j].place(j, i);
                } catch (IllegalArgumentException e) {}
            }
        }
    }

    public Board(Board board) {
        parent = board;

        height = board.height;
        width = board.width;

        pieceBoard = new Piece[height][width];
        whitePieces = new ArrayList<>();
        blackPieces = new ArrayList<>();

        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j++) {
                try {
                    pieceBoard[i][j] = new Piece(board.pieceBoard[i][j]);

                    if (pieceBoard[i][j].isWhite) whitePieces.add(pieceBoard[i][j]);
                    else blackPieces.add(pieceBoard[i][j]);
                    pieceBoard[i][j].place(j, i);
                } catch (IllegalArgumentException e) {}
            }
        }

    }

    // check if this position is valid, if so return the piece if not return null
    public Piece checkPiece(int x, int y) {
        return (x >= 0 && x < width && y >= 0 && y < height) ? pieceBoard[y][x] : null;
    }

    public void draw(Graphics g, double chessWidth, double chessHeight, ChessPlayer player) {

        double boardWidth = chessWidth / (double) width;
        double boardHeight = chessHeight / (double) height;

        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j++) {
                Color bColor = (i - j) % 2 == 0 ? new Color(0xEDC6A6) : new Color(0xA05B23);
                Color sColor = bColor;
                if (pieceBoard[i][j] != null) {
                    if (pieceBoard[i][j].inCheck) sColor = Color.RED;
                    if (pieceBoard[i][j].equals(player.selectedPiece)) sColor = Color.YELLOW;
                }
                g.setColor(sColor);
                g.fillRect((int) (j * boardWidth), (int) (i * boardHeight), (int) (boardWidth) + 1, (int) (boardHeight) + 1);

                if (pieceBoard[i][j] != null) {
                    // draw inside area if its in check or selected
                    if (pieceBoard[i][j].inCheck || pieceBoard[i][j].equals(player.selectedPiece)) {
                        g.setColor(bColor);
                        g.fillRect((int) (j * boardWidth) + SELWIDTH, (int) (i * boardHeight) + SELWIDTH, (int) (boardWidth) + 1 - 2*SELWIDTH, (int) (boardHeight) + 1 - 2*SELWIDTH);
                    }

                    //draw piece
                    g.setColor(pieceBoard[i][j].isWhite ? Color.WHITE : Color.BLACK);
                    Tools.drawCenteredString(new String[] {pieceBoard[i][j].toString()}, (int) ((j + 0.5) * boardWidth), (int) ((i + 0.5) * boardHeight), g);
                }
            }
        }
    }

    // force-move a piece to a location and updates lists if it kills another piece
    public void movePiece(Piece piece, int x, int y) {
        parent = new Board(this);

        // remove from LIST
        if (pieceBoard[y][x] != null) {
            ArrayList<Piece> pieceList = piece.isWhite ? blackPieces : whitePieces;
            for (int p = 0; p<pieceList.size(); p++) {
                if (pieceList.get(p).equals(pieceBoard[y][x])) {
                    pieceList.remove(p);
                    break;
                }
            }
        }

        //move piece
        pieceBoard[piece.y][piece.x] = null; 
        pieceBoard[y][x] = piece;
        piece.place(x, y);
        piece.hasMoved = true;
    }

    public void moveBack() {
        if (parent != null) {
            pieceBoard = new Piece[height][width];
            whitePieces = new ArrayList<>();
            blackPieces = new ArrayList<>();

            for (int i = 0; i < height; i++) {
                for (int j = 0; j < width; j++) {
                    try {
                        pieceBoard[i][j] = new Piece(parent.pieceBoard[i][j]);

                        if (pieceBoard[i][j].isWhite) whitePieces.add(pieceBoard[i][j]);
                        else blackPieces.add(pieceBoard[i][j]);
                        pieceBoard[i][j].place(j, i);
                    } catch (IllegalArgumentException e) {}
                }
            }
        }
    }

    // check if in Check! (Decently fast I'm happy with this)
    // this works for multiple kings!
    public boolean check(boolean isWhite) {
        ArrayList<Piece> pieceList = isWhite ? whitePieces : blackPieces;
        ArrayList<Piece> oPieceList = !isWhite ? whitePieces : blackPieces;
        for (Piece bp : pieceList) {
            if (bp.pieceType == Piece.Type.KING) {
                bp.inCheck = false;
                for (Piece wp : oPieceList) {
                    if (wp.validMove(bp.x, bp.y, this)) {
                        bp.inCheck = true;
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
