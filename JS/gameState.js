function debug() {
    console.log(arguments);
}

$(document).ready(function() {

    generateBoard();

    addPieces(true);
    addPieces(false);

    // Once the board is all set up, we bind events for all pieces.
    bindPieceEvents();
});

function bindPieceEvents() {
    $('#board').on('click', '.piece', function() {
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

            $(this).append(eSelectedPiece.clone(true));
            eParent.html('');

            removeHighlighting();
        }
    });
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
    $('#board .col.highlight').removeClass('highlight');

    $('#piece-selection').data('selected', null);
}