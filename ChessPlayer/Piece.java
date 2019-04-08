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
    
    public Piece(Piece piece) {
        if (piece == null) throw new IllegalArgumentException();
        isWhite = piece.isWhite;
        x = piece.x;
        y = piece.y;
        pieceType = piece.pieceType;
        hasMoved = piece.hasMoved;
        inCheck = piece.inCheck;
    }

    public Piece(String piece) {
        if (piece == null) throw new IllegalArgumentException();

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

    // THIS IS THE SPAGHETTI CODE FOR THE RULES OF CHESS I'm kinda happy with how this turned out honestly
    public boolean validMove(int x, int y, Board board) {
        Piece newPiece = board.checkPiece(x, y);
        if (newPiece != null && newPiece.isWhite == isWhite) return false;

        switch (pieceType) {
            case PAWN:
                if (newPiece == null) return (y == this.y+(isWhite ? -1 : 1) || (!hasMoved && y == this.y+(isWhite ? -2 : 2))) &&  x == this.x;
                else return y == this.y+(isWhite ? -1 : 1) && Math.abs(x-this.x) == 1;
            case KING:
                return Math.abs(x-this.x) + Math.abs(y-this.y) == 1 || (Math.abs(x-this.x) == 1 && Math.abs(y-this.y) == 1);
            case KNIGHT:
                return (Math.abs(x-this.x) == 1 && Math.abs(y-this.y) == 2) || (Math.abs(x-this.x) == 2 && Math.abs(y-this.y) == 1);
            case ROOK:
                if (x == this.x) {
                    int dir = this.y>y ? 1 : -1;
                    for (int i=1;i != Math.abs(this.y-y);i++) if (board.checkPiece(x,y+dir*i) != null) return false;
                    return true;
                } else if (y == this.y) {
                    int dir = this.x>x ? 1 : -1;
                    for (int i=1;i != Math.abs(this.x-x);i++) if (board.checkPiece(x+dir*i,y) != null) return false;
                    return true;
                }
                return false;
            case BISHOP:
                if (Math.abs(this.y-y) == Math.abs(this.x-x)) {
                    int dirx = this.x>x ? 1 : -1;
                    int diry = this.y>y ? 1 : -1;
                    for (int i=1;i != Math.abs(this.x-x);i++) if (board.checkPiece(x+dirx*i,y+diry*i) != null) return false;
                    return true;
                }
                return false;
            case QUEEN:
                if (Math.abs(this.y-y) == Math.abs(this.x-x)) {
                    int dirx = this.x>x ? 1 : -1;
                    int diry = this.y>y ? 1 : -1;
                    for (int i=1;i != Math.abs(this.x-x);i++) if (board.checkPiece(x+dirx*i,y+diry*i) != null) return false;
                    return true;
                } else if (x == this.x) {
                    int dir = this.y>y ? 1 : -1;
                    for (int i=1;i != Math.abs(this.y-y);i++) if (board.checkPiece(x,y+dir*i) != null) return false;
                    return true;
                } else if (y == this.y) {
                    int dir = this.x>x ? 1 : -1;
                    for (int i=1;i != Math.abs(this.x-x);i++) if (board.checkPiece(x+dir*i,y) != null) return false;
                    return true;
                }
                return false;
            default:
                return false;

        }
    }

    /*public int[][] getMoves() {
        //POSSIBLE MAKER-FASTER: have a fixed length of the currentMoves array and then truncate the end that would be null

        int[][] currentMoves = new int[0][2];
        int[] newPos;
        Piece newPiece = null;

        switch (pieceType) {
            case PAWN:
                if (!hasMoved) {
                    newPos = new int[] {x, y + 2*(isWhite?-1:1)};
                    newPiece = checkPiece(newPos);
                    if (onBoard(newPos) && newPiece == null) currentMoves = addMove(currentMoves, newPos);
                }

                newPos = new int[] {x, y + (isWhite?-1:1)};
                newPiece = checkPiece(newPos);
                if (onBoard(newPos) && newPiece == null) currentMoves = addMove(currentMoves, newPos);


                newPos = new int[] {x+1, y + (isWhite?-1:1)};
                newPiece = checkPiece(newPos);
                if (newPiece != null && newPiece.isWhite == !isWhite) currentMoves = addMove(currentMoves, newPos);

                newPos = new int[] {x-1, y + (isWhite?-1:1)};
                newPiece = checkPiece(newPos);
                if (newPiece != null && newPiece.isWhite == !isWhite) currentMoves = addMove(currentMoves, newPos);
                //to implement: en passant move
                //Could also be shortened down to fix reusing code
                break;
            case KING:
                for (int i=0;i<8;i++) {
                    currentMoves = addNewMove(currentMoves, x+Tools.sgn(Math.cos(i * 2*Math.PI/8.)), y+Tools.sgn(Math.sin(i * 2*Math.PI/8.)));
                }

                //to implement: castling and not moving for checkmate, also make it in 1 for loop maybe
                break;
            case QUEEN:
                for (int i=0;i<8;i++) {
                    currentMoves = addRowOfMoves(currentMoves, Tools.sgn(Math.cos(i * 2*Math.PI/8.)),Tools.sgn(Math.sin(i * 2*Math.PI/8.)));
                }
                break;
            case BISHOP:
                for (int i=0;i<4;i++) {
                    currentMoves = addRowOfMoves(currentMoves, Tools.sgn(Math.cos((i+0.5) * 2*Math.PI/4.)),Tools.sgn(Math.sin((i+0.5) * 2*Math.PI/4.)), board);
                }
                break;
            case KNIGHT:
                currentMoves = addNewMove(currentMoves, x+1, y+2, board);
                currentMoves = addNewMove(currentMoves, x+2, y+1, board);
                currentMoves = addNewMove(currentMoves, x+1, y-2, board);
                currentMoves = addNewMove(currentMoves, x+2, y-1, board);
                currentMoves = addNewMove(currentMoves, x-1, y-2, board);
                currentMoves = addNewMove(currentMoves, x-2, y-1, board);
                currentMoves = addNewMove(currentMoves, x-1, y+2, board);
                currentMoves = addNewMove(currentMoves, x-2, y+1, board);

                //this could be done in one loop
                break;
            case ROOK:
                for (int i=0;i<4;i++) {
                    currentMoves = addRowOfMoves(currentMoves, Tools.sgn(Math.cos(i * 2*Math.PI/4.)), Tools.sgn(Math.sin(i * 2*Math.PI/4.)), board);
                }
                break;
            default:
                break;

        }
        return currentMoves;
    }

    public int[][] addRowOfMoves(int[][] currentMoves, int xStep, int yStep, Board board) {
        int[] newPos = new int[]{x + xStep, y + yStep};
        Piece newPiece = board.checkPiece(newPos);
        int[][] movesToReturn = currentMoves;

        while (board.inBoard(newPos) && newPiece == null) {
            movesToReturn = addMove(movesToReturn, newPos);
            newPos = new int[] {newPos[0] + xStep, newPos[1] + yStep};
            newPiece = board.checkPiece(newPos);
        }
        if (board.inBoard(newPos) && newPiece.isWhite == !isWhite) movesToReturn = addMove(movesToReturn, newPos);
        return movesToReturn;
    }

    public int[][] addNewMove(int[][] currentMoves, int x, int y, Board board) {
        int[] newPos = new int[] {x, y};
        Piece newPiece = board.checkPiece(newPos);
        return (board.inBoard(newPos) && (newPiece == null || newPiece.isWhite == !isWhite)) ? addMove(currentMoves, newPos) : currentMoves;
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
    }*/

    public boolean equals(Piece other) {
        return other != null && other.x == x && other.y == y;
    }
}