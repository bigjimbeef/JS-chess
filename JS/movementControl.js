function Move(sDirection, zDistance, sThreatenedPiece) {
    if ( _.isArray(zDistance) ) {
        this.details = {
            rowDistance: zDistance[0],
            colDistance: zDistance[1],
            threatened_piece: sThreatenedPiece
        }
    }
    else {
        this.details = {
            direction: sDirection,
            distance: zDistance,
            threatened_piece: sThreatenedPiece
        }
    }
}
Move.prototype.getMoveDetails = function() {
    return this.details;
}
Move.prototype.setThreatenedPiece = function(sPiece) {
    this.details.threatened_piece = sPiece;
}

$.fn.getValidMoves = function(bSimulate) {
    var sPieceType = $(this).data('piece');
    var sColour = $(this).data('col');
    var bWhite = sColour == "white";
    var rowCol = getCellRC(this);

    var aValidMoves = [];
    switch ( sPieceType ) {
        case "pawn":
            aValidMoves = pawnMoves(rowCol, bWhite);
            aValidMoves = _.union(aValidMoves, pawnTakes(rowCol, bWhite));
            break;
        case "rook":
            aValidMoves = rookMoves(rowCol, bWhite);
            break;
        case "knight":
            aValidMoves = knightMoves(rowCol, bWhite);
            break;
        case "bishop":
            aValidMoves = bishopMoves(rowCol, bWhite);
            break;
        case "queen":
            aValidMoves = queenMoves(rowCol, bWhite);
            break;
        case "king":
            aValidMoves = kingMoves(rowCol, bWhite);
            break;
        default:
            break; 
    }

    if ( bSimulate ) {
        // After we've determined the valid moves, we need to check for check.
        // We do this by simulating the positions of each valid move, and checking if it puts us in check.
        aValidMoves = simulateAllMoves($(this), aValidMoves, sColour);
        aValidMoves = _.without(aValidMoves, undefined);
    }

    // Now return the list of reasonable moves.
    return aValidMoves;
}

function getCellRC(eCell) {
    var eCol= eCell.parent();
    var iCol = $(eCol).data('column');

    var eRow= eCol.parent();
    var iRow = $(eRow).data('row');

    return {
        row: iRow,
        col: iCol
    };
}

function jumpOffset(rowCol, rowJump, colJump) {
    var iRow = rowCol.row;
    var iCol = rowCol.col;

    iRow += rowJump;
    iCol += colJump;

    return {
        row: iRow,
        col: iCol
    }
}

function offsetMove(rowCol, sDirection, iDistance) {
    var iRow = rowCol.row;
    var iCol = rowCol.col;

    switch ( sDirection ) {
        case "up":
            iRow = (rowCol.row + iDistance);
            break;
        case "upleft":
            iRow = (rowCol.row + iDistance);
            iCol = (rowCol.col - iDistance);
            break;
        case "upright":
            iRow = (rowCol.row + iDistance);
            iCol = (rowCol.col + iDistance);
            break;
        case "down":
            iRow = (rowCol.row - iDistance);
            break;
        case "downleft":
            iRow = (rowCol.row - iDistance);
            iCol = (rowCol.col - iDistance);
            break;
        case "downright":
            iRow = (rowCol.row - iDistance);
            iCol = (rowCol.col + iDistance);
            break;
        case "left":
            iCol = (rowCol.col - iDistance);
            break;
        case "right":
            iCol = (rowCol.col + iDistance);
            break;
        default:
            console.error("This is not a valid direction!", sDirection);
            break;
    }

    return {
        row: iRow,
        col: iCol
    };
}

function checkJumpMove(rowCol, rowOffset, colOffset, bWhite) {
    var offset = jumpOffset(rowCol, rowOffset, colOffset);
    
    return checkCell(offset, bWhite, true);
}

// Check bounds, and if it's a valid attack move. 
function checkMoveResult(rowCol, move, bWhite, bAttack) {
    var offset = offsetMove(rowCol, move.direction, move.distance);

    return checkCell(offset, bWhite, bAttack);
}

function isThreat(sInput) {
    var zMatch = sInput.match(/^X_(.*)/);

    return zMatch != null ? zMatch[1] : false;
}

function checkCell(offset, bWhite, bAttack) {
    var eCell = getBoardCell(offset.row, offset.col);
    var ePiece = eCell.children('.piece');

    var sOurColour = bWhite ? "white" : "black";

    if ( offset.row > 8 || offset.row < 1 || offset.col > 8 || offset.col < 1 ) {
        return "invalid";
    }

    if ( ePiece.length == 0 ) {
        return "valid";
    }
    else {
        var bHasEnemy = ePiece.data('col') != sOurColour;

        if ( bAttack && bHasEnemy ) {
            return "X_" + ePiece.data('piece');
        }

        return "invalid";
    } 
}

function pawnMoves(rowCol, bWhite) {
    var aValidMoves = [];
    var sDirection = bWhite ? "up" : "down";

    // Are we still in the starting position?
    if ( bWhite && rowCol.row == 2 ||
        !bWhite && rowCol.row == 7 ) {
        var move = new Move(sDirection, 2);
        var sResult = checkMoveResult(rowCol, move.getMoveDetails(), bWhite, false);
        if ( sResult == 'valid' ) {
            aValidMoves.push(move);           
        }
    }

    var move = new Move(sDirection, 1);
    var sResult = checkMoveResult(rowCol, move.getMoveDetails(), bWhite, false);
    if ( sResult == 'valid' ) {
        aValidMoves.push(move);
    }

    return aValidMoves;
}
function pawnTakes(rowCol, bWhite) {
    var aValidMoves = [];

    // Have we already moved? (we need to consider en-passant)
    if ( bWhite && rowCol.row == 2 ||
        !bWhite && rowCol.row == 7 ) {
        // TODO: En passant.
    }

    var aDirections = bWhite ? ["upleft", "upright"] : ["downleft", "downright"];
    for (var i = 0; i < aDirections.length; ++i ) {
        var move = new Move(aDirections[i], 1);
        var sResult = checkMoveResult(rowCol, move.getMoveDetails(), bWhite, true);
        var zPiece = isThreat(sResult);

        if ( _.isString(zPiece) ) {
            move.setThreatenedPiece(zPiece);
            aValidMoves.push(move);
        }
    };

    return aValidMoves;
}

// For rooks, bishops and queens we need to check in each direction.
// Once we hit a piece, we stop processing that direction.
function getValidLongMoves(aDirections, rowCol, bWhite, bKing) {
    aValidMoves = [];

    // King can only move one square. Everyone else can move miles.
    var iLength = bKing ? 2 : 8;

    for ( var i = 0; i < aDirections.length; ++i ) {
        for ( var j = 1; j < iLength; ++j ) {
            var move = new Move(aDirections[i], j);
            var sResult = checkMoveResult(rowCol, move.getMoveDetails(), bWhite, true);
            if ( sResult == 'valid' || isThreat(sResult) ) {
                aValidMoves.push(move);
                var zPiece = isThreat(sResult);
                if ( _.isString(zPiece) ) {
                    move.setThreatenedPiece(zPiece);
                    break;
                }
            }
            else {
                break;
            } 
        }
    };

    return aValidMoves;
}

function rookMoves(rowCol, bWhite) {
    var aValidMoves = [];
    var aDirections = ["up","down","left","right"];

    aValidMoves = getValidLongMoves(aDirections, rowCol, bWhite);

    return aValidMoves;
}

function bishopMoves(rowCol, bWhite) {
    var aValidMoves = [];
    var aDirections = ["upleft","downleft","upright","downright"];

    aValidMoves = getValidLongMoves(aDirections, rowCol, bWhite);

    return aValidMoves;
}

function queenMoves(rowCol, bWhite) {
    var aValidMoves = [];
    var aDirections = ["up","down","left","right","upleft","downleft","upright","downright"];

    aValidMoves = getValidLongMoves(aDirections, rowCol, bWhite);

    return aValidMoves;
}

function knightMoves(rowCol, bWhite) {
    var aValidMoves = [];
    var aOffsets = [
        [1,-2],[2,-1],[2,1],[1,2],
        [-1,-2],[-2,-1],[-2,1],[-1,2]
    ];

    for ( var i = 0; i < aOffsets.length; ++i ) {
        var move = new Move(null, aOffsets[i]);
        var sResult = checkJumpMove(rowCol, move.getMoveDetails().rowDistance, move.getMoveDetails().colDistance, bWhite);
        if ( sResult == 'valid' || isThreat(sResult) ) {
           aValidMoves.push(move);         
       }
    }

    return aValidMoves;
}

function kingMoves(rowCol, bWhite) {
    var aValidMoves = [];
    var aDirections = ["up","down","left","right","upleft","downleft","upright","downright"];

    aValidMoves = getValidLongMoves(aDirections, rowCol, bWhite, true);

    return aValidMoves;
}