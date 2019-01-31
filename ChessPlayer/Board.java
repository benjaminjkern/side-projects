package chessplayer;

import java.awt.Color;
import java.awt.Graphics;
import java.util.ArrayList;
import kern.Tools;

public class Board {

    //width of selected square boundary box for animation
    private static final int SELWIDTH = 10;

    private Piece[][] pieceBoard;
    private Piece selectedPos;

    private ArrayList<Piece> whitePieces;
    private ArrayList<Piece> blackPieces;

    public int width, height;

    public Board(String[][] stringBoard) {
        whitePieces = new ArrayList<Piece>();
        blackPieces = new ArrayList<Piece>();

        height = stringBoard.length;
        width = stringBoard[0].length;
        pieceBoard = new Piece[height][width];
        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j++) {
                pieceBoard[i][j] = Piece.parse(stringBoard[i][j]);
                if (pieceBoard[i][j] != null) {
                    if (pieceBoard[i][j].isWhite) whitePieces.add(pieceBoard[i][j]);
                    else blackPieces.add(pieceBoard[i][j]);
                    pieceBoard[i][j].place(j, i);
                }
            }
        }
    }

    public Moves[] getMoves(boolean white) {
        ArrayList<Piece> pieces = white?whitePieces:blackPieces;
        Moves[] possibleMoves = new Moves[pieces.size()];
        for (int p = 0; p < pieces.size(); p++) {
            possibleMoves[p] = new Moves(pieces.get(p));
        }
        for (Moves mi:possibleMoves) {
            System.out.println(mi.toString());
        }
        return possibleMoves;
    }

    public Piece checkPiece(int[] pos) {
        return inBoard(pos) ? pieceBoard[pos[1]][pos[0]] : null;
    }

    public boolean inBoard(int[] pos) {
        return pos == null ? false : pos[0] >= 0 && pos[0] < width && pos[1] >= 0 && pos[1] < height;
    }

    public void selectPosition(int x, int y, boolean whiteMove) {
        Piece selectedP = checkPiece(new int[] {x,y});
        if (selectedPos == null) {
            if (selectedP != null && selectedP.isWhite == whiteMove) selectedPos = selectedP;
        } else {
            if (selectedP == null || selectedP.isWhite != whiteMove) {
                if (selectedPos.isAMove(new int[] {x,y})) {
                    movePiece(selectedPos, new int[] {x,y});
                    selectedPos = null;
                    ChessGame.whiteMove = !ChessGame.whiteMove;
                }
            } else if (selectedPos.samePos(selectedP)) {
                selectedPos = null;
            } else if (selectedP.isWhite == whiteMove) {
                selectedPos = selectedP;
            }
        }
    }

    public void movePiece(Piece pieceToMove, int[] newPos) {
        pieceBoard[newPos[1]][newPos[0]] = pieceToMove;
        pieceBoard[pieceToMove.y][pieceToMove.x] = null;
        pieceToMove.place(newPos[0], newPos[1]);
        pieceToMove.hasMoved = true;
    }

    public void draw(Graphics g) {

        double boardWidth = (double) ChessGame.width / (double) width;
        double boardHeight = (double) ChessGame.height / (double) height;

        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j++) {
                boolean isSelected = selectedPos != null && j == selectedPos.x && i == selectedPos.y;
                g.setColor(isSelected ? Color.YELLOW : ((i - j) % 2 == 0 ? new Color(0xEDC6A6) : new Color(0xA05B23)));
                g.fillRect((int) (j * boardWidth), (int) (i * boardHeight), (int) (boardWidth) + 1, (int) (boardHeight) + 1);

                if (isSelected) {
                    g.setColor((i - j) % 2 == 0 ? new Color(0xEDC6A6) : new Color(0xA05B23));
                    g.fillRect((int) (j * boardWidth) + SELWIDTH, (int) (i * boardHeight) + SELWIDTH, (int) (boardWidth) + 1 - 2*SELWIDTH, (int) (boardHeight) + 1 - 2*SELWIDTH);
                }
                if (pieceBoard[i][j] != null) {
                    g.setColor(pieceBoard[i][j].isWhite ? Color.WHITE : Color.BLACK);
                    Tools.drawCenteredString(new String[] {pieceBoard[i][j].toString()}, (int) ((j + 0.5) * boardWidth), (int) ((i + 0.5) * boardHeight), g);
                }
            }
        }
    }

    class Moves {
        Piece p;
        int[][] moves;

        Moves(Piece p) {
            this.p = p;
            this.moves = p.getMoves();
        }

        public String toString() {
            String returnString = "( \"" + p.toString() + "\" , [" + p.x + ", "+p.y+"] , [";
            if (moves.length>0) {
                returnString += Tools.print(moves[0]);
                for (int i=1;i<moves.length;i++) {
                    returnString += ", "+Tools.print(moves[i]);
                }
            }
            return returnString + "] )";
        }
    }
}
