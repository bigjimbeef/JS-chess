function getBoardCell(iRow, iCol) {
    var eBoard = $('#board');
    var sSelector = "div.row-" + iRow + " div.col-" + iCol;

    return $(eBoard.find(sSelector));
}

function addPieces(bWhite) {
    var aBackRow = ["rook","knight","bishop","queen","king","bishop","knight","rook"];
    if ( !bWhite ) {
        aBackRow = aBackRow.reverse();
    }

    var sColour = bWhite ? "white" : "black";
    debug("Adding pieces to the board for " + sColour + "...");

    var iBackRow = bWhite ? 1 : 8;
    var iFrontRow = bWhite ? 2 : 7;
    for ( var i = 0; i < aBackRow.length; ++i ) {
        var eBackRowCell = getBoardCell(iBackRow, i + 1);
        var eFrontRowCell = getBoardCell(iFrontRow, i + 1);

        var sBackRowPiece = aBackRow[i];
        var sFrontRowPiece = "pawn";

        var eBackRowPiece = $("<div class='piece " + sBackRowPiece + "'></div>");
        eBackRowPiece.addClass(sColour).data('piece', sBackRowPiece).data('col', sColour);
        $(eBackRowCell).append(eBackRowPiece);

        var eFrontRowPiece = $("<div class='piece " + sFrontRowPiece + "'></div>");
        eFrontRowPiece.addClass(sColour).data('piece', sFrontRowPiece).data('col', sColour);
        $(eFrontRowCell).append(eFrontRowPiece);
    }
}