bWhiteTurn = true;
iTurnNum = 0;

$(document).ready(function() {

    generateBoard();

    addPieces(true);
    addPieces(false);

    // Once the board is all set up, we bind events for all pieces.
    bindPieceEvents();
});

function getSelectedPiece() {
    var zPiece = $('#piece-selection').data('selected');

    return zPiece;
}

function isPlayablePiece(ePiece) {
    var sColor = $(ePiece).data('col');

    return ( bWhiteTurn && sColor == "white" || !bWhiteTurn && sColor == "black" );
}

function getPlayerPieces() {
    var sTarget = bWhiteTurn ? "white" : "black";
    return $('#board .piece.' + sTarget);
}
function getOpponentPieces() {
    var sTarget = bWhiteTurn ? "black" : "white";
    return $('#board .piece.' + sTarget);
}

function bindPieceEvents() {
    /*    
    $('#board').on('click', '.piece', function() {
        if ( bWhiteTurn && $(this).data('col') == "black"
         || !bWhiteTurn && $(this).data('col') == "white" ) {
            return;
        }

        if ( !$('#piece-selection').data('selected') ) {
            console.log("There is a piece");

            var aValidMoves = $(this).getValidMoves(true);

            if ( aValidMoves.length > 0 ) {
                // Highlight the cells indicated by these moves.
                highlightValidMoves(this, aValidMoves);
                
                // We have this piece selected.
                $('#piece-selection').data('selected', this); 
            }
        }
        else if ( $('#piece-selection').data('selected') ==  this ) {
            console.log("Clicked same one...");

            tidyBoard();
        }
    });
    */

    function revertElement(zDropped) {
        var bDropped = zDropped.length > 0;

        // We're selecting a new piece.
        if ( !bDropped ) {
            tidyBoard();
        }

        return !bDropped;        
    }

    // Set the pieces to be draggable.
    $('#board .piece').draggable({
        revert: revertElement,
        start: function(){
            // Set a z-index on the piece to ensure it's in front.
            $(this).addClass('moving');

            var aValidMoves = $(this).getValidMoves(true);

            if ( aValidMoves.length > 0 ) {
                // Highlight the cells indicated by these moves.
                highlightValidMoves(this, aValidMoves);
                
                // We have this piece selected.
                $('#piece-selection').data('selected', this); 
            }
        },
        stop: function() {
            // Z-index undone.
            $(this).removeClass('moving');
        },
        // Centralise the piece to the cursor
        cursorAt: {
            top: 25,
            left: 25
        }
    });
    // Update which pieces are currently draggable.
    getPlayerPieces().draggable('enable');
    getOpponentPieces().draggable('disable');

    /*
    $('#board').on('mousedown', '.piece', function() {
        console.log("MOUSE DOWN");

        if ( bWhiteTurn && $(this).data('col') == "black"
         || !bWhiteTurn && $(this).data('col') == "white" ) {
            return;
        }

        var aValidMoves = $(this).getValidMoves(true);

        if ( aValidMoves.length > 0 ) {
            // Highlight the cells indicated by these moves.
            highlightValidMoves(this, aValidMoves);
            
            // We have this piece selected.
            $('#piece-selection').data('selected', this); 
        }
    });
*/

    /*
    // This represents the user clicking on a valid move square for their piece.
    $('#board').on('click', '.highlight', function() {
        if ( $('#piece-selection').data('selected') ) {
            var eSelectedPiece = $($('#piece-selection').data('selected'));
            var eParent = eSelectedPiece.parent();

            var pieceRC = getCellRC($(eSelectedPiece));
            $(this).append('<div></div>');
            var targetRC = getCellRC($(this).find('div'));
            $(this).find('div').remove();

            // Generate the move.
            generateMoveNotation(pieceRC, targetRC)

            var iRowDiff = targetRC.row - pieceRC.row;
            var iColDiff = targetRC.col - pieceRC.col;

            var iXOffset = iColDiff * 52.5;
            var iYOffset = iRowDiff * 52.5;

            $(eParent).trigger('mouseout');
            tidyBoard();

            var that = this;
            $(eSelectedPiece).addClass('moving');
            $(eSelectedPiece).animate({
                bottom: iYOffset,
                left: iXOffset
            }, 500, function() {
                $(eSelectedPiece).css('bottom', 0);
                $(eSelectedPiece).css('left', 0);
                $(eSelectedPiece).removeClass('moving');
                $(eSelectedPiece).stop();

                $(that).append(eSelectedPiece.clone(true));
                eParent.html('');

                // Swipsy swopsy.
                changeTurn();
            });
        }
    });
    */
}

function getRowColAsNotation(rowCol) {
    var iRow = rowCol.row;

    var aCols = ["a","b","c","d","e","f","g","h"];
    var iCol = aCols[rowCol.col - 1];

    return {
        row: iRow,
        col: iCol
    }
}

function generateMoveNotation(sourceRowCol, destRowCol) {
    var src = getRowColAsNotation(sourceRowCol);
    var dest = getRowColAsNotation(destRowCol);

    var eCell = getBoardCell(sourceRowCol.row, sourceRowCol.col);
    var eTarget = getBoardCell(destRowCol.row, destRowCol.col);
    var sCapture = ( typeof eTarget.find('.piece').data('piece') != "undefined" ) ? "x" : "";

    var ePiece = eCell.find('.piece');
    var sPiece = "";
    if ( ePiece.data('piece') && ePiece.data('piece') != "pawn" ) {
        switch(ePiece.data('piece')){
            case "rook":
                sPiece = "R";
                break;
            case "bishop":
                sPiece = "B";
                break;
            case "knight":
                sPiece = "N";
                break;
            case "queen":
                sPiece = "Q";
                break;
            case "king":
                sPiece = "K";
                break;
            default:
                console.error("Invalid piece!");
                break;
        }
    }
    var sMove = sPiece + src.col + sCapture + src.row 
                + " " 
                + sPiece + dest.col + sCapture + dest.row;

    var eLi = $("<li></li>");
    eLi.text(sMove);

    eLi.appendTo($('#movelist ol'));
}

function changeTurn() {
    iTurnNum++;
    bWhiteTurn = !bWhiteTurn;

    var sTarget = bWhiteTurn ? "white" : "black";
 
    if ( bWhiteTurn ) {
        var iTurn = parseInt($('#turnNumber').text());
        iTurn++;
        $('#turnNumber').text(iTurn);
    }

    $('#playerTurn').text(sTarget);

    // Update which pieces are currently draggable.
    getPlayerPieces().draggable('enable');
    getOpponentPieces().draggable('disable');
}

function highlightValidMoves(ePiece, aValidMoves) {
    console.log(aValidMoves);

    for ( var i = 0; i < aValidMoves.length; ++i ) {
        var move = aValidMoves[i].getMoveDetails();

        highlightSingleMove(ePiece, move);
    };
}

function highlightSingleMove(ePiece, move) {
    if ( typeof move.distance != "undefined" ) {
        var iDistance = move.distance;
        var rowCol = getCellRC($(ePiece));

        rowCol = offsetMove(rowCol, move.direction, move.distance);      
    }
    else {
        var rowCol = getCellRC($(ePiece));

        rowCol = jumpOffset(rowCol, move.rowDistance, move.colDistance);
    }

    var eMoveTarget = getBoardCell(rowCol.row, rowCol.col);
    eMoveTarget.addClass('highlight');

    eMoveTarget.droppable({
        drop: function(event, ui) {
            placePiece($(ui.draggable), $(this));
        }
    });
}

// Main function for placing a piece and ending the turn.
function placePiece(ePiece, eTarget) {
    $(eTarget).html($(ePiece));

    // Center the piece after jQuery UI messes with inline styles in dragging it.
    $(ePiece).css({
        top: 0,
        left: 0
    });

    // Remove the highlights and disable droppables.
    tidyBoard();

    // Swipsy swopsy.
    changeTurn();
}

function tidyBoard() {
    // Remove droppable.
    $('#board .col.highlight').droppable("destroy");
    $('#board .col').removeClass('highlight hover hover-black');
    $('#piece-selection').data('selected', null);
}

function getAllMoves(sColour) {
    var dStart = new Date();
    console.log("Start:", dStart.getMilliseconds())

    var ePieces = $('#board .piece.' + sColour);

    var moves = {};
    _.each(ePieces, function(v,i) {
        var sPiece = $(v).data('piece');
        
        if ( _.isUndefined(moves[sPiece]) ) {
            moves[sPiece] = [];
        }

        moves[sPiece] = moves[sPiece].concat($(v).getValidMoves());
    });

    console.log("These are the valid moves.", moves);

    var dEnd = new Date();
    console.log("End:", dEnd.getMilliseconds())

    return moves;
}

function getThreatenedPieces(moves) {
    // Check for all moves that are threatening a piece.
    var aThreatMoves = [];
    _.each( moves, function(v,i) { 
        _.each( v, function(val, idx) { 
            if ( val.details.threatened_piece ) {
                aThreatMoves.push(val.details.threatened_piece);
            }
        }); 
    });

    console.log("These pieces are threatened:", aThreatMoves);

    return aThreatMoves;
}

function getCheckMoves(aThreatMoves) {
    var bCheck = false;
    _.each(aThreatMoves, function(v,i) {
        if ( v == "king" ) {
            bCheck = true;
            // Get out as fast as possible!
            return;
        }
    });

    return bCheck;
}

function checkForCheck(sColour) {
    // Get all possible moves.
    var moves = getAllMoves(sColour);

    // Get all moves that threaten a piece.
    var aThreatMoves = getThreatenedPieces(moves);

    // Get all moves which threaten the King specifically.
    var bCheck = getCheckMoves(aThreatMoves);

    return bCheck;
}

function simulateAllMoves(piece, aMoveList, sColour) {
    var aToRemove = [];
    _.each(aMoveList, function(v,i) {
        var move = v.details;
        var rowCol = getCellRC(piece);

        var newPos = {};
        if ( piece.data('piece') != "knight" ) {
            newPos = offsetMove(rowCol, v.details.direction, v.details.distance);
        }
        else {
            newPos = jumpOffset(rowCol, v.details.rowDistance, v.details.colDistance);
        }

        var bCheck = simulateSingleMove(piece, newPos, sColour);
        if ( bCheck ) {
            aToRemove.push(v);
        }
    });

    for( var i = 0; i < aMoveList.length; ++i ) {
        if ( _.indexOf(aToRemove, aMoveList[i]) != -1 ) {
            delete aMoveList[i];
        }
    }

    return aMoveList;
}

function simulateSingleMove(piece, newRowCol, sColour) {
    var eParent = $(piece).parent();
    var eCell = getBoardCell(newRowCol.row, newRowCol.col);

    var eCurrentPiece = eCell.find('.piece').clone(true, true);

    // Clone the current piece.
    var oData = $(piece).data();
    var ePiece = $(piece).clone(true, true);
    
    eCell.html(ePiece);

    // Now we check to see if we're in check.
    var sOther = ( sColour == "white" ) ? "black" : "white";
    var bCheck = checkForCheck(sOther);

    // Now go back to where we were.
    eCell.html('');
    eCell.append(eCurrentPiece);

    return bCheck;
}