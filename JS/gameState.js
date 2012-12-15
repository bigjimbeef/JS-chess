function debug() {
    console.log(arguments);
}

bWhiteTurn = true;
iTurnNum = 0;

$(document).ready(function() {

    generateBoard();

    addPieces(true);
    addPieces(false);

    // Once the board is all set up, we bind events for all pieces.
    bindPieceEvents();
});

function bindPieceEvents() {
    $('#board').on('click', '.piece', function() {
        if ( bWhiteTurn && $(this).data('col') == "black"
         || !bWhiteTurn && $(this).data('col') == "white" ) {
            return;
        }

        if ( !$('#piece-selection').data('selected') ) {
            debug("There is a piece");

            var aValidMoves = $(this).getValidMoves();

            if ( aValidMoves.length > 0 ) {
                // Highlight the cells indicated by these moves.
                highlightValidMoves(this, aValidMoves);
                
                // We have this piece selected.
                $('#piece-selection').data('selected', this); 
            }
        }
        else if ( $('#piece-selection').data('selected') ==  this ) {
            console.log("Clicked same one...");

            removeHighlighting();
        }
    });

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
            removeHighlighting();

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
}

function highlightValidMoves(ePiece, aValidMoves) {
    console.log(aValidMoves);

    for ( var i = 0; i < aValidMoves.length; ++i ) {
        var move = aValidMoves[i].getMoveDetails();

        highlightSingleMove(ePiece, move);
    };
}

function highlightSingleMove(ePiece, move) {
    console.log(move);

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
}

function removeHighlighting() {
    $('#board .col.highlight').removeClass('highlight hover');

    $('#piece-selection').data('selected', null);
}