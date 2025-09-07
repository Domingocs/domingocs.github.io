jQuery(function ($) {

    //****
    // ADD ACTIVE CLASSES ON LOAD
    //****
    $(document).ready(function () {
        $('.img-mult').each(function () {
            $(this).children().eq(0).addClass('activeimg');
            $('.content-container').removeClass("pinned");
            $('.content-container').removeClass('pineado');
        });
    });

    //****
    // PINNED POSTS SLIDER FUNCTIONALITY
    //****

    //Variables
    //change value of n to adjust time of autoplay
    // 1 sec = 1000
    var n = 3000;
    var m = 2000;
    var autoplay;
    var autoplay2;
    var i = 0;

    $(document).ready(function startAutoplay() {
        autoplay = setInterval(function () {
            if (i > $(".sldcrd").length - 1) { i = 0; }
            $(".sldcrd").removeClass('activecard');
            $(".pin-slider-bullets").children().removeClass('slct');
            $('.pinned-content').find(".sldcrd").eq(i).addClass('activecard');
            $('.pin-slider-bullets').children().eq(i).addClass('slct');
            i++;
        }, n);
    });

    //Multi Image Sliders Functionality 

    $(document).ready(function startAutoplay2() {
        $('.img-mult').each(function () {
            var j = 0;
            var className = this;
            autoplay2 = setInterval(function () {
                if (j > $(className).children().length - 1) { j = 0; }
                $(className).children().removeClass('activeimg');
                $(className).children().eq(j).addClass('activeimg');
                j++;
            }, m);
        });
    });

    //mouse over pause and resume Card Slider
    $(".pinned-content").mouseenter(function () { clearInterval(autoplay); });
    $(".pinned-content").mouseleave(function startAutoplay() {
        autoplay = setInterval(function () {
            if (i > $(".sldcrd").length - 1) { i = 0; }
            $(".sldcrd").removeClass('activecard');
            $(".pin-slider-bullets").children().removeClass('slct');
            $('.pinned-content').find(".sldcrd").eq(i).addClass('activecard');
            $('.pin-slider-bullets').children().eq(i).addClass('slct');
            i++;
        }, n);
    });

    //Arrows passing to prev or next slide
    $('.pinleft').on("click", function () {
        i--
        if (i < 0) { i = $(".sldcrd").length - 1; }
        $(".sldcrd").removeClass('activecard');
        $('.sldbtn').removeClass('slct');
        $('.pinned-content').find(".sldcrd").eq(i).addClass('activecard');
        $('.sldbtn').eq(i).addClass('slct');
    });

    $('.pinright').on("click", function () {
        i++
        if (i > $(".sldcrd").length - 1) { i = 0; }
        $(".sldcrd").removeClass('activecard');
        $('.sldbtn').removeClass('slct');
        $('.pinned-content').find(".sldcrd").eq(i).addClass('activecard');
        $('.sldbtn').eq(i).addClass('slct');
    });

    //buttons calling respective slide
    $('.pin-slider-bullets').on("click", '.sldbtn', function () {
        i = $(this).index();
        $(".sldcrd").removeClass('activecard');
        $('.sldbtn').removeClass('slct');
        $('.pinned-content').find(".sldcrd").eq(i).addClass('activecard');
        $('.sldbtn').eq(i).addClass('slct');
    });

    //****
    // ABOUT AND CONTACT CARDS FUNCTIONALITY
    //****
    $('.about').on("click", function () {
        $('#contact-info').removeClass("active");
        $('.contact').removeClass("active");
        $('#about-me').toggleClass("active");
        $('.about').toggleClass("active");
        $('.mobile-menu').toggleClass("mobile-menu-open");
        $('.menu-container').toggleClass("mobile-menu-open");
        $('.mobile-menu').children().toggleClass("mobile-menu-open")

    });
    $('.contact').on("click", function () {
        $('#about-me').removeClass("active");
        $('.about').removeClass("active");
        $('#contact-info').toggleClass("active");
        $('.contact').toggleClass("active");
        $('.mobile-menu').toggleClass("mobile-menu-open");
        $('.menu-container').toggleClass("mobile-menu-open");
        $('.mobile-menu').children().toggleClass("mobile-menu-open")

    });
    $('.fa-xmark').on("click", function () {
        $('#contact-info').removeClass("active");
        $('.contact').removeClass("active");
        $('#about-me').removeClass("active");
        $('.about').removeClass("active");
    });

    //****
    // MOBILE MENU FUNCTIONALITY
    //****
    $('.mobile-menu').on("click", function () {
        $('.mobile-menu').toggleClass("mobile-menu-open");
        $('.menu-container').toggleClass("mobile-menu-open");
        $('.mobile-menu').children().toggleClass("mobile-menu-open")
    });

    //****
    // ERROR SPLASH SCREEN BYPASS
    //****
    $('.stahp').on("click", function () {
        $('#under-construction').css("display", "none");
    });

    //****
    // LANGUAGE SWITCHER FUNCTIONALITY
    //****

    // Set Language on Load
    var langVl = { langu: document.documentElement.lang };
    $(document).ready(function () {
        if (langVl.langu == "es-ES") {
            $('.langtext').css("display", "none");
            $('.estext').css("display", "flex");
        }
        else {
            $('.langtext').css("display", "none");
            $('.entext').css("display", "flex");
        }
    });

    // Change Language
    $('.enbtn').on("click", {
        langu: "en"
    }, setLanguage);

    $('.esbtn').on("click", {
        langu: "es-ES"
    }, setLanguage);

    function setLanguage(event) {
        if (event.data.langu == "es-ES") {
            $('.langtext').css("display", "none");
            $('.estext').css("display", "flex");
        }
        else {
            $('.langtext').css("display", "none");
            $('.entext').css("display", "flex");
        }
        console.log(event.data.langu);
    }

});