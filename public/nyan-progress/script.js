    $('.inner').animate({width: '100%'}, 5000, function()
    {
        setTimeout(function()
        {
            $('.inner2').hide();
            $('.inner').css('background', '#ffffff').html("Done!");
        }, 100);
    });
