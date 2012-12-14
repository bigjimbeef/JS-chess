$(document).ready(function() {
    debug("Setting up colour selection...");

    initSelector();
});

function initSelector() {
    var eButtons = $('#colour-selector .btn');

    eButtons.click(function() {
        $('#board')
            .removeClass('default blue red')
            .addClass($(this).val());
    });
}