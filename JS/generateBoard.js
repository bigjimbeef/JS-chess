// Generates the board.

NUM_ROWS = 8;
NUM_COLS = 8;

function generateBoard() {
    console.log("Generating the board...");

    var eBoard = $('#board');

    for ( var i = NUM_ROWS; i > 0; --i )
    {
        var eRow = $("<div class='row row-" + i + "'></div>");
        var sOddEven = i % 2 == 0 ? "even" : "odd";
        eRow.addClass(sOddEven);
        eRow.data('row', i);

        for ( var j = 1; j <= NUM_COLS; ++j )
        {
            var eColContainer = $("<div class='separator'></div>");

            var eCol = $("<div class='col col-" + j + "'></div>");
            sOddEven = j % 2 == 0 ? "even" : "odd";
            eCol.addClass(sOddEven);
            eCol.data('column', j);

            $(eCol).hover(
                function(event) {
                    var sTarget = $('#playerTurn').text() != 'black' ? "hover" : "hover-black";
                    $(this).addClass(sTarget);                       
                }, 
                function() {
                    $(this).removeClass('hover hover-black');
                }
            );

            eColContainer.append(eCol);
            eRow.append(eColContainer);
        }

        eBoard.append(eRow);
    }
}