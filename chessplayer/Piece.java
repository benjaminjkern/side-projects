package chessplayer;

class Piece {

    boolean inCheck;
    boolean hasMoved;
    boolean isWhite;
    Type pieceType;
    public int x,y;

    enum Type {
        PAWN, KING, QUEEN, BISHOP, KNIGHT, ROOK;
    }
    
    public Piece(Piece piece, int x, int y) {
        isWhite = piece.isWhite;
        this.x = x;
        this.y = y;
        pieceType = piece.pieceType;
        hasMoved = true;
        inCheck = piece.inCheck;
    }

    public Piece(String piece, int x, int y) {
        if (piece == null) throw new IllegalArgumentException();

        this.x = x;
        this.y = y;

        String parsedString = piece.trim().toLowerCase();

        if (parsedString.length() != 2) throw new IllegalArgumentException();

        switch (parsedString.charAt(0)) {
            default:
            case 'w':
                isWhite = true;
                break;
            case 'b':
                isWhite = false;
                break;
        }

        switch (parsedString.charAt(1)) {
            default:
            case 'p':
                pieceType = Type.PAWN;
                break;
            case 'k':
                pieceType = Type.KING;
                break;
            case 'q':
                pieceType = Type.QUEEN;
                break;
            case 'b':
                pieceType = Type.BISHOP;
                break;
            case 'n':
                pieceType = Type.KNIGHT;
                break;
            case 'r':
                pieceType = Type.ROOK;
                break;
        }

        hasMoved = false;
    }

    public void place(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public String toString() {
        String returnString = isWhite?"White ":"Black ";

        switch (pieceType) {
            case PAWN:
                returnString += "Pawn";
                break;
            case KING:
                returnString += "King";
                break;
            case QUEEN:
                returnString += "Queen";
                break;
            case BISHOP:
                returnString += "Bishop";
                break;
            case KNIGHT:
                returnString += "Knight";
                break;
            case ROOK:
                returnString += "Rook";
                break;
            default:
                return "";
        }

        return returnString;
    }

    // Checks ONLY IF THE POSITION IS VALID RELATIVE TO THE PIECE, THE BOARD ITSELF CHECKS
    // WHETHER THE POSITION IS ACTUALLY ON THE BOARD AND WHETHER THE PIECE SELECTED CAN BE HIT
    public boolean validMove(int x, int y, boolean isPiece) {
        switch (pieceType) {
            case PAWN: // jesus fucking christ
                return isPiece ? y == this.y+(isWhite ? -1 : 1) && Math.abs(x-this.x) == 1 : (y == this.y+(isWhite ? -1 : 1) || (!hasMoved && y == this.y+(isWhite ? -2 : 2))) &&  x == this.x;
            case KING:
                return Math.abs(x-this.x) + Math.abs(y-this.y) == 1 || (Math.abs(x-this.x) == 1 && Math.abs(y-this.y) == 1);
            case KNIGHT:
                return (Math.abs(x-this.x) == 1 && Math.abs(y-this.y) == 2) || (Math.abs(x-this.x) == 2 && Math.abs(y-this.y) == 1);
            case ROOK:
                return x == this.x || y == this.y;
            case BISHOP:
                return Math.abs(x - this.x) == Math.abs(y - this.y);
            case QUEEN:
                return Math.abs(x - this.x) == Math.abs(y - this.y) || x == this.x || y == this.y;
            default:
                return false;
        }
    }

    public boolean equals(Piece other) {
        return other != null && other.x == x && other.y == y;
    }
}