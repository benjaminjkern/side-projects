import java.awt.Color;

import javax.swing.Icon;
import javax.swing.ImageIcon;
import javax.swing.JLabel;
import javax.swing.JPanel;

public class Piece extends JPanel {

    boolean hasMoved;
    boolean isWhite;
    Type pieceType;
    int x,y;
    
    enum Type {
        Pawn, King, Queen, Bishop, Knight, Rook;
    }
    
    public Piece(boolean isWhite, Type pieceType) {
        this.isWhite = isWhite;
        this.pieceType = pieceType;
        hasMoved = false;
    }
    
    public static Piece parse(String piece) {
        //I feel like I can do this better but its FINE for now
        
        if (piece == null) return null;
        
        boolean isWhite;
        Type pieceType;
        
        String parsedString = piece.trim().toLowerCase();
        if (parsedString.length() != 2) return null;
        
        switch (parsedString.charAt(0)) {
            case 'w':
                isWhite = true;
                break;
            case 'b':
                isWhite = false;
                break;
            default:
                return null;
        }

        switch (parsedString.charAt(1)) {
            case 'p':
                pieceType = Type.Pawn;
                break;
            case 'k':
                pieceType = Type.King;
                break;
            case 'q':
                pieceType = Type.Queen;
                break;
            case 'b':
                pieceType = Type.Bishop;
                break;
            case 'n':
                pieceType = Type.Knight;
                break;
            case 'r':
                pieceType = Type.Rook;
                break;
            default:
                return null;
        }
        
        return new Piece(isWhite, pieceType);
    }
    
    public void place(int x, int y) {
        this.x = x;
        this.y = y;
    }
    
    public String toString() {
        String returnString = isWhite?"White ":"Black ";

        switch (pieceType) {
            case Pawn:
                returnString += "Pawn";
                break;
            case King:
                returnString += "King";
                break;
            case Queen:
                returnString += "Queen";
                break;
            case Bishop:
                returnString += "Bishop";
                break;
            case Knight:
                returnString += "Knight";
                break;
            case Rook:
                returnString += "Rook";
                break;
            default:
                return null;
        }
        
        return returnString;
    }
    
    public int[][] getMoves() {
        //POSSIBLE MAKER-FASTER: have a fixed length of the currentMoves array and then truncate the end that would be null
        
        int[][] currentMoves = new int[0][2];
        int[] newPos = {};
        Piece newPiece = null;
        
        switch (pieceType) {
            case Pawn:
                if (!hasMoved) {
                    newPos = new int[] {x, y + 2*(isWhite?-1:1)};
                    newPiece = ChessGame.board.checkPiece(newPos);
                    if (ChessGame.board.inBoard(newPos) && newPiece == null) currentMoves = addMove(currentMoves, newPos);
                }
                
                newPos = new int[] {x, y + (isWhite?-1:1)};
                newPiece = ChessGame.board.checkPiece(newPos);
                if (ChessGame.board.inBoard(newPos) && newPiece == null) currentMoves = addMove(currentMoves, newPos);
       
                
                newPos = new int[] {x+1, y + (isWhite?-1:1)};
                newPiece = ChessGame.board.checkPiece(newPos);
                if (newPiece != null && newPiece.isWhite == !isWhite) currentMoves = addMove(currentMoves, newPos);
                
                newPos = new int[] {x-1, y + (isWhite?-1:1)};
                newPiece = ChessGame.board.checkPiece(newPos);
                if (newPiece != null && newPiece.isWhite == !isWhite) currentMoves = addMove(currentMoves, newPos);
                //to implement: en passant move
                //Could also be shortened down to fix reusing code
                break;
            case King:
                for (int i=0;i<8;i++) {
                    currentMoves = addNewMove(currentMoves, x+Game.sgn(Math.cos(i * 2*Math.PI/8.)), y+Game.sgn(Math.sin(i * 2*Math.PI/8.)));
                }
                
                //to implement: castling and not moving for checkmate, also make it in 1 for loop maybe
                break;
            case Queen:
                for (int i=0;i<8;i++) {
                    currentMoves = addRowOfMoves(currentMoves, Game.sgn(Math.cos(i * 2*Math.PI/8.)),Game.sgn(Math.sin(i * 2*Math.PI/8.)));
                }
                break;
            case Bishop:
                for (int i=0;i<4;i++) {
                    currentMoves = addRowOfMoves(currentMoves, Game.sgn(Math.cos((i+0.5) * 2*Math.PI/4.)),Game.sgn(Math.sin((i+0.5) * 2*Math.PI/4.)));
                }
                break;
            case Knight:
                currentMoves = addNewMove(currentMoves, x+1, y+2);
                currentMoves = addNewMove(currentMoves, x+2, y+1);
                currentMoves = addNewMove(currentMoves, x+1, y-2);
                currentMoves = addNewMove(currentMoves, x+2, y-1);
                currentMoves = addNewMove(currentMoves, x-1, y-2);
                currentMoves = addNewMove(currentMoves, x-2, y-1);
                currentMoves = addNewMove(currentMoves, x-1, y+2);
                currentMoves = addNewMove(currentMoves, x-2, y+1);
                
                //this could be done in one loop
                break;
            case Rook:
                for (int i=0;i<4;i++) {
                    currentMoves = addRowOfMoves(currentMoves, Game.sgn(Math.cos(i * 2*Math.PI/4.)), Game.sgn(Math.sin(i * 2*Math.PI/4.)));
                }
                break;
            default:
                break;
                
        }
        return currentMoves;
    }
    
    public int[][] addRowOfMoves(int[][] currentMoves, int xStep, int yStep) {
        int[] newPos = new int[]{x + xStep, y + yStep};
        Piece newPiece = ChessGame.board.checkPiece(newPos);
        int[][] movesToReturn = currentMoves;
        
        while (ChessGame.board.inBoard(newPos) && newPiece == null) {
            movesToReturn = addMove(movesToReturn, newPos);
            newPos = new int[] {newPos[0] + xStep, newPos[1] + yStep};
            newPiece = ChessGame.board.checkPiece(newPos);
        }
        if (ChessGame.board.inBoard(newPos) && newPiece.isWhite == !isWhite) movesToReturn = addMove(movesToReturn, newPos);
        return movesToReturn;
    }
    
    public int[][] addNewMove(int[][] currentMoves, int x, int y) {
        int[] newPos = new int[] {x, y};
        Piece newPiece = ChessGame.board.checkPiece(newPos);
        return (ChessGame.board.inBoard(newPos) && (newPiece == null || newPiece.isWhite == !isWhite)) ? addMove(currentMoves, newPos) : currentMoves;
    }
    
    public static int[][] addMove(int[][] currentMoves, int[] newPos) {
        int[][] newMoves = new int[currentMoves.length+1][2];
        for (int i=0;i<currentMoves.length;i++) {
            newMoves[i][0] = currentMoves[i][0];
            newMoves[i][1] = currentMoves[i][1];
        }
        newMoves[currentMoves.length][0] = newPos[0];
        newMoves[currentMoves.length][1] = newPos[1];
        return newMoves;
    }
    
    public static int[][] addMoves(int[][] currentMoves, int[][] toAddMoves) {
        int[][] newMoves = currentMoves;
        for (int[] m:toAddMoves) {
            newMoves = addMove(newMoves, m);
        }
        return newMoves;
    }
    
    public boolean samePos(Piece other) {
        return other.x == x && other.y == y;
    }
    
    public boolean isAMove(int[] pos) {
        int[][] moves = getMoves();
        for (int[] i:moves) {
            if (pos[0]==i[0] && pos[1]==i[1]) return true;
        }
        return false;
    }
}
