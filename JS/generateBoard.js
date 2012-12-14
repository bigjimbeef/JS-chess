// Generates the board.

NUM_ROWS = 8;
NUM_COLS = 8;

function generateBoard() {
    debug("Generating the board...");

    var eBoard = $('#board');

    for ( var i = NUM_ROWS; i > 0; --i )
    {
        var eRow = $("<div class='row row-" + i + "'></div>");
        var sOddEven = i % 2 == 0 ? "even" : "odd";
        eRow.addClass(sOddEven);
        eRow.data('row', i);

        for ( var j = 1; j <= NUM_COLS; ++j )
        {
            var eCol = $("<div class='col col-" + j + "'></div>");
            sOddEven = j % 2 == 0 ? "even" : "odd";
            eCol.addClass(sOddEven);
            eCol.data('column', j);

            eCol.bindCellEvents();

            eRow.append(eCol);
        }

        eBoard.append(eRow);
    }
}

$.fn.bindCellEvents = function () {
    $(this).unbind('hover');
    $(this).hover(
        function() {
            $(this).addClass('hovered');
        },
        function() {
            $(this).removeClass('hovered');
        }
    );
}