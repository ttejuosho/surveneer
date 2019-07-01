$(document).ready(function() {
    console.log("App Loaded");
    $('input#getId').on('change', () => {
        if ($(this).is(':checked')) {
            $('#getId').val(true);
        } else {
            $('#getId').val(false);
        }
    });
});