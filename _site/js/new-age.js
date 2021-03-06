var playlistId = "PL_phu8k3RmzR8p1VmgZLoY1FJ4igmCrqg";
        
(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 100
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 50
        }
    });
    
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        $("#name-sufix").remove();
        $("#image-prefix").attr("style", "");
        $("#image-prefix").parent().addClass("text-center");
    }
    
    $(document).ready(function(){
        
        var t = $('#dickkTable').DataTable({
            responsive: true,
            "order": [[ 4, "desc" ]],
            "language": {
                "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Czech.json"
            },
            'sDom': '<"top"f>t<"bottom"p>',
            "drawCallback": function() {
                $("img.lazy").lazyload();
            }
        });
        
        var column = t.column(4);
        column.visible(! column.visible());
        
        downloadSourceOfHtml("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + playlistId + "&key=AIzaSyDuPBD7duBdgYcHEkLTWH1bIhoYrH3fvQU", t);
        
        var url = "https://docs.google.com/spreadsheets/pub?key=1L2tnkb1k9O-WzvEbPvfVACXrAgkkU8kTqW2_FNULq30&output=html";
        var googleSpreadsheet = new GoogleSpreadsheet();
        googleSpreadsheet.url(url);
        googleSpreadsheet.load(function(result) {

            for(var i = 0; i < result.items.length; i++) {

                var item = result.items[i];

                var new_item = $(".template").clone();
                new_item.removeClass("template");
                new_item.removeClass("hidden");
                new_item.find(".date").text(item.cas);
                new_item.find(".post-title").text(item.nadpis);
                new_item.find(".description").text(item.popis);

                $(".news").append(new_item);

            }

        });
        
    });
    
})(jQuery); // End of use strict

function downloadSourceOfHtml(url, table) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            parseDiCKK(xhttp.responseText, table);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function parseDiCKK(response, table) {
    
    var source = JSON.parse(response);
    
    for(var i = 0; i < source.items.length; i++) {
        
        var item = source.items[i].snippet;
        
        var start = item.description.indexOf("Mluvím o komiksech:");
        var end = item.description.indexOf("Další info na:");
        
        if(start > -1 && end > -1) {
        
            var comicsItems = item.description.substring(start, end).replace("Mluvím o komiksech:", "").split("\n");
        
            for(var c = comicsItems.length - 1; c >= 0; c--) {
            
                if(comicsItems[c].length == 0) continue;
                
                var name = comicsItems[c].substring(0, comicsItems[c].indexOf("https://comicsdb.cz/")).trim();
                var comicsdb = comicsItems[c].substring(comicsItems[c].indexOf("https://comicsdb.cz/")).trim();
            
                table.row.add( [name, '<a href="' + comicsdb + '" target="_blank">' + comicsdb + '</a>','<a href="https://www.youtube.com/watch?v=' + item.resourceId.videoId + '" target="_blank"><img src="' + item.thumbnails.default.url + '" height="90px" style="display: inline;"/></a>','<a href="https://www.youtube.com/watch?v=' + item.resourceId.videoId + '" target="_blank">' + item.title + "</a>", Date.parse(item.publishedAt)] ).draw( false );
            
            }
        
        }
        
    }
    
    if(typeof(source.nextPageToken) !== "undefined" && source.nextPageToken !== null) {
        
        downloadSourceOfHtml("https://www.googleapis.com/youtube/v3/playlistItems?pageToken=" + source.nextPageToken + "&part=snippet&playlistId=" + playlistId + "&key=AIzaSyDuPBD7duBdgYcHEkLTWH1bIhoYrH3fvQU", table);
        
    }
    else {
        
        table.columns.adjust().draw();
        
    }
    
}