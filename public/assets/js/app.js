$(function() {
    console.log("App Loaded");
    type = ['primary', 'info', 'success', 'warning', 'danger'];
    survenaire = {
        showNotification: function(from, align) {
            color = Math.floor((Math.random() * 4) + 1);

            $.notify({
                icon: "tim-icons icon-bell-55",
                message: "Welcome to <b>Black Dashboard</b> - a beautiful freebie for every web developer."

            }, {
                type: type[color],
                timer: 8000,
                placement: {
                    from: from,
                    align: align
                }
            });
        }
    };

   $("input[name='getId']").on('change', function(){
    $(this).val(this.checked ? true : false);
  });

$('#LikertOption').on('click', ()=> {
    $('input.LikertAgreement').prop("checked", true);
    $('#LikertMoreOptions').toggleClass('d-none');
    $('#LikertOptionDiv').toggleClass('d-none');
});

$("input[name='options']").on('change', function(){
    if (!$('#LikertMoreOptions').hasClass('d-none')){
        if (!$(this).val().includes('Likert')){
            $('#LikertMoreOptions').toggleClass('d-none');
            $('#LikertOptionDiv').toggleClass('d-none');
            $('input.LikertAgreement').prop("checked", false);
        }
    }
  });

});