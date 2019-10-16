/* eslint-disable camelcase */
/* eslint-disable max-len */
$(function() {
    // console.log("App Loaded");
    $().ready(function() {
        $sidebar = $('.sidebar');
        $navbar = $('.navbar');
        $main_panel = $('.main-panel');

        $full_page = $('.full-page');

        $sidebar_responsive = $('body > .navbar-collapse');
        sidebar_mini_active = true;
        white_color = false;

        window_width = $(window).width();

        fixed_plugin_open = $('.sidebar .sidebar-wrapper .nav li.active a p').html();


        $('.fixed-plugin a').click(function(event) {
            if ($(this).hasClass('switch-trigger')) {
                if (event.stopPropagation) {
                    event.stopPropagation();
                } else if (window.event) {
                    window.event.cancelBubble = true;
                }
            }
        });

        $('.fixed-plugin .background-color span').click(function() {
            $(this).siblings().removeClass('active');
            $(this).addClass('active');

            const new_color = $(this).data('color');

            if ($sidebar.length != 0) {
                $sidebar.attr('data', new_color);
            }

            if ($main_panel.length != 0) {
                $main_panel.attr('data', new_color);
            }

            if ($full_page.length != 0) {
                $full_page.attr('filter-color', new_color);
            }

            if ($sidebar_responsive.length != 0) {
                $sidebar_responsive.attr('data', new_color);
            }
        });

        $('.switch-sidebar-mini input').on('switchChange.bootstrapSwitch', function() {
            // eslint-disable-next-line no-unused-vars
            const $btn = $(this);

            // eslint-disable-next-line camelcase
            if (sidebar_mini_active == true) {
                $('body').removeClass('sidebar-mini');
                // eslint-disable-next-line camelcase
                sidebar_mini_active = false;
                blackDashboard.showSidebarMessage('Sidebar mini deactivated...');
            } else {
                $('body').addClass('sidebar-mini');
                // eslint-disable-next-line camelcase
                sidebar_mini_active = true;
                blackDashboard.showSidebarMessage('Sidebar mini activated...');
            }

            // we simulate the window Resize so the charts will get updated in realtime.
            const simulateWindowResize = setInterval(function() {
                window.dispatchEvent(new Event('resize'));
            }, 180);

            // we stop the simulation of Window Resize after the animations are completed
            setTimeout(function() {
                clearInterval(simulateWindowResize);
            }, 1000);
        });

        //   $('.switch-change-color input').on("switchChange.bootstrapSwitch", function() {
        //     var $btn = $(this);

        //     if (white_color == true) {

        //       $('body').addClass('change-background');
        //       setTimeout(function() {
        //         $('body').removeClass('change-background');
        //         $('body').removeClass('white-content');
        //       }, 900);
        //       white_color = false;
        //     } else {

        //       $('body').addClass('change-background');
        //       setTimeout(function() {
        //         $('body').removeClass('change-background');
        //         $('body').addClass('white-content');
        //       }, 900);

        //       white_color = true;
        //     }


        //   });

        $('.light-badge').click(function() {
            $('body').addClass('white-content');
        });

        $('.dark-badge').click(function() {
            $('body').removeClass('white-content');
        });
    });

    type = ['primary', 'info', 'success', 'warning', 'danger'];
    survenaire = {
        showNotification: function(type, from, align, msg) {
            color = Math.floor((Math.random() * 4) + 1);
            $.notify({
                icon: 'tim-icons icon-bell-55',
                message: msg,

            }, {
                type: type,
                timer: 5000,
                placement: {
                    from: from,
                    align: align,
                },
            });
        },
    };

    $('input[name=\'getId\']').on('change', function() {
        $(this).val(this.checked ? true : false);
    });

    $('input[name=\'showTOU\']').on('change', function() {
        $(this).val(this.checked ? true : false);
        $('.surveyTOUInput').toggleClass('d-none');
    });

    $('input[name=\'getInstructions\']').on('change', function() {
        $('.surveyInstructionsInput').toggleClass('d-none');
    });

    $('input[name=\'optionType\']').on('change', function() {
        $('.MultipleChoiceInput').val('');
        if ($(this).val() === 'Likert') {
            $(this).prop('checked', true);
            $('#LikertOptionDiv').addClass('d-none');
            $('#LikertMoreOptions').removeClass('d-none');
            $('#MultipleChoiceMoreOptions').addClass('d-none');
            $('#MultipleChoiceDiv').removeClass('d-none');
            $('input.LikertAgreement').prop('checked', true);
            $('.MultipleChoiceOption').prop('checked', false);
        } else if ($(this).val() === 'MultipleChoice') {
            $('input.LikertAgreement').prop('checked', false);
            $(this).prop('checked', true);
            $('#LikertOptionDiv').removeClass('d-none');
            $('#LikertMoreOptions').addClass('d-none');
            $('#MultipleChoiceMoreOptions').removeClass('d-none');
        } else if (!$(this).val().includes('Likert')) {
            $(this).prop('checked', true);
            $('.MultipleChoiceOption').prop('checked', false);
            $('#LikertOptionDiv').removeClass('d-none');
            $('#LikertMoreOptions').addClass('d-none');
            $('#MultipleChoiceDiv').removeClass('d-none');
            $('#MultipleChoiceMoreOptions').addClass('d-none');
            $('.MultipleChoiceOption1').removeAttr('name');
        }
    });

    // Check if radio button is checked
    $('#newQuestionForm').on('submit', () => {
        if ($('input[id=MultipleChoiceOption]:checked').length < 1) {
            $('#MultipleChoiceMoreOptions').remove();
        }
    });

    $('#editSurvey').on('click', () => {
        $('.surveyEditInput').removeAttr('readonly');
        $('#surveyUpdateButton').removeClass('d-none');
        $('#surveySaveButton').removeClass('d-none');
        $('#editSurvey').addClass('d-none');
        $('.form-check').removeClass('disabled');
        $('.surveyEditCheck').attr('disabled', false);
    });

    $('#surveySaveButton').on('click', () => {
        $('.surveyEditInput').attr('readonly', true);
        $('#surveyUpdateButton').addClass('d-none');
        $('#surveySaveButton').addClass('d-none');
        $('#editSurvey').removeClass('d-none');
        $('.form-check').addClass('disabled');
        $('.surveyEditCheck').attr('disabled', true);
    });

    //const socket = io.connect( 'http://localhost:8080' );
    const socket = io.connect('surveneer.herokuapp.com');
    socket.on('news', function(data) {
        $('.responseCount').text(data.message);
        $('#numberOfRespondents').val(data.message);
        $('#ResponseSection').prepend(data.domData);
    });

    // eslint-disable-next-line require-jsdoc
    // function getRandomInt(max) {
    //   return Math.floor(Math.random() * Math.floor(max));
    // }

    // Need Grouped Bar Charts https://codepen.io/Shokeen/pen/NpgbKg
    // Q1 [YesCount,NoCount]
    // fetch('/api/charts/optionCounts/1').then(function(data) {
    //   // socket.emit('response', {message: getRandomInt(9)});
    //   return data.json();
    // }).then(function(data) {
    //   const ctx = $('#chartBig1');
    //   new Chart(ctx, {
    //     type: 'bar',
    //     data: {
    //       labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    //       datasets: [{
    //         label: 'Response Chart',
    //         data: data.answerCounts[0],
    //         backgroundColor: [
    //           '#008080',
    //           '#800000',
    //           '#FF00FF',
    //           '#00FF00',
    //           '#000080',
    //           '#FF0000',
    //           '#008080',
    //           '#800000',
    //           '#FF00FF',
    //           '#00FF00',
    //           '#000080',
    //           '#00FF00',
    //           '#000080',
    //         ],
    //       }],
    //     },
    //     options: {
    //       scales: {
    //         yAxes: [{
    //           ticks: {
    //             beginAtZero: true,
    //           },
    //         }],
    //       },
    //     },
    //   });
    // });
});