package chessplayer;

// THIS IS THE STATE / NODE
// run as a two way tree (stores parents and all children)

import java.awt.Color;
import java.awt.Graphics;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import chessplayer.Piece.Type;
import kern.Tools;

public class Board {

    //width of selected square boundary box for animation
    public static final int SELWIDTH = 10;

    private Map<Integer, Piece> pieceMap;

    public Board parent;
    private ArrayList<Board> children;

    // size of board in squares
    public int width, height;
    private boolean whiteCheck, blackCheck;
    private boolean whiteMove;

    private Board(Board parentBoard) {
        parent = parentBoard;
        height = parentBoard.height;
        width = parentBoard.width;
        whiteMove = !parentBoard.whiteMove;
        whiteCheck = blackCheck = false;
        pieceMap = new HashMap<>(parentBoard.pieceMap);
        children = new ArrayList<>();
    }

    public Board(String[] boardString, boolean whiteMove) {
        // this is kinda janky but I think it'll work!

        pieceMap = new HashMap<>();
        height = boardString.length;
        width = 0;

        this.whiteMove = whiteMove;
        children = new ArrayList<>();

        for (int i = 0; i < boardString.length; i++) {
            String[] stringLine = boardString[i].length() > 0 ? boardString[i].split(" ") : new String[0];
            if (stringLine.length > width) width = stringLine.length;

            for (int j = 0; j < stringLine.length; j++) pieceMap.put(hashCode(j, i), new Piece(stringLine[j], j, i));
        }

        checkmate();
    }

    public boolean inBoard(int x, int y) {
        return x >= 0 && x < width && y >= 0 && y < height;
    }

    public void draw(Graphics g, double chessWidth, double chessHeight) {
        double boardWidth = chessWidth / (double) width;
        double boardHeight = chessHeight / (double) height;

        // draw board
        for (int i = 0; i < height; i++) {
            for (int j = 0; j < width; j++) {
                Color bColor = (i - j) % 2 == 0 ? new Color(0xEDC6A6) : new Color(0xA05B23);
                g.setColor(bColor);
                g.fillRect((int) (j * boardWidth), (int) (i * boardHeight), (int) (boardWidth) + 1, (int) (boardHeight) + 1);
            }
        }

        // draw pieces
        for (Piece piece : pieceMap.values()) {
            // draw inside area if its in check
            if (piece.inCheck) {
                g.setColor(Color.RED);
                g.fillRect((int) (piece.x * boardWidth), (int) (piece.y * boardHeight), (int) (boardWidth) + 1, (int) (boardHeight) + 1);

                g.setColor((piece.x - piece.y) % 2 == 0 ? new Color(0xEDC6A6) : new Color(0xA05B23));
                g.fillRect((int) (piece.x * boardWidth) + SELWIDTH, (int) (piece.y * boardHeight) + SELWIDTH, (int) (boardWidth) + 1 - 2*SELWIDTH, (int) (boardHeight) + 1 - 2*SELWIDTH);
            }

            //draw piece
            g.setColor(piece.isWhite ? Color.WHITE : Color.BLACK);
            Tools.drawCenteredString(new String[] {piece.toString()}, (int) ((piece.x + 0.5) * boardWidth), (int) ((piece.y + 0.5) * boardHeight), g);
        }
    }

    // check if in Check! (Decently fast I'm happy with this)
    // this also works for multiple kings!
    private boolean inCheck(boolean isWhite) {
        if ((isWhite && whiteCheck) || (!isWhite && blackCheck)) return true;

        ArrayList<Piece> kingList = new ArrayList<>();
        ArrayList<Piece> opPieceList = new ArrayList<>();

        for (Piece piece : pieceMap.values()) {
            if (piece.isWhite != isWhite) {
                opPieceList.add(piece);
                continue;
            }

            if (piece.pieceType == Piece.Type.KING) kingList.add(piece);
        }

        for (Piece king : kingList) {
            king.inCheck = false;
            for (Piece opPiece : opPieceList) {
                if (validMove(opPiece, king.x, king.y, true) != null) {
                    king.inCheck = true;
                    return true;
                }
            }
        }
        return false;
    }

    public boolean checkmate() {
        whiteCheck = inCheck(true);
        blackCheck = inCheck(false);

        if (!inCheck(whiteMove)) return false;
        
        getChildren();
        for (Board child:children) if (!child.inCheck(whiteMove)) return false;

        return true;
    }

    public Board validMove(Piece myPiece, int x, int y, boolean breakCheck) {
        int hashKey = hashCode(x,y);
        boolean filledSpace = pieceMap.containsKey(hashKey);

        // it is not valid if the selected space is not on the board, or
        // if it is not deemed by the piece to be valid, or
        // if there is a piece at the space of the same color
        if (myPiece == null || !inBoard(x,y) || !myPiece.validMove(x, y, filledSpace) || (filledSpace && pieceMap.get(hashKey).isWhite == myPiece.isWhite)) return null;

        // this iterates from myPiece to the point in question and says its not valid if there are filled spaces between the piece and the space
        if (myPiece.pieceType == Type.BISHOP || myPiece.pieceType == Type.ROOK || myPiece.pieceType == Type.QUEEN) {
            int dirX = Tools.sgn(myPiece.x - x);
            int dirY = Tools.sgn(myPiece.y - y);
            for (int d = 1; d < Math.max(Math.abs(myPiece.x - x),  Math.abs(myPiece.y - y)); d++) 
                if (pieceMap.containsKey(hashCode(x + d*dirX,y + d*dirY))) return null;
        }

        // creates a new state and checks if that state is in check, if it is then its not valid!
        Board childBoard = childBoard(myPiece, x, y);
        return breakCheck || !childBoard.inCheck(myPiece.isWhite) ? childBoard : null; // breakCheck is so that it doesnt recurse on the inCheck() method
    }

    public Piece pieceAt(int x, int y) {
        int hash = hashCode(x,y);
        return pieceMap.containsKey(hash) ? pieceMap.get(hash) : null;
    }

    private static int hashCode(int x, int y) {
        return 1000*x + y;
    }

    public Board childBoard(Piece myPiece, int x, int y) {
        Board newBoard = new Board(this);
        newBoard.pieceMap.remove(hashCode(myPiece.x,myPiece.y));
        
        Piece newPiece = new Piece(myPiece, x, y);
        // handle pawn promotion
        if (newPiece.pieceType == Type.PAWN && (newPiece.y == 0 || newPiece.y == height-1)) newPiece.pieceType = Type.QUEEN;
        newBoard.pieceMap.put(hashCode(x,y), newPiece);
        return newBoard;
    }
    
    public int score() {
        return 0; // TODO: Figure this out
    }

    // this is done horribly naively right now, its okay cuz it still works but this is gonna slow down a shit ton when I let it recurse
    public ArrayList<Board> getChildren() {
        if (pieceMap.size() <= 2) return new ArrayList<>();
        
        // if it has not been generated already, then DO IT
        if (children.isEmpty()) {
            children = new ArrayList<>();
            ArrayList<Piece> myPieceList = new ArrayList<>();

            for (Piece piece : pieceMap.values()) if (piece.isWhite == whiteMove) myPieceList.add(piece);

            for (Piece myPiece : myPieceList) {
                for (int i = 0;i<width;i++) {
                    for (int j = 0;j<height;j++) {
                        Board validBoard = validMove(myPiece, i, j, false);
                        if (validBoard != null) children.add(validBoard);
                    }
                }
            }
        }
        
        return children;
    }
}
