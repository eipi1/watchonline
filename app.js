/**
 * Created by sarowar on 9/10/15.
 */
'use strict';
global.$ = $;
//var cheerio = require('cheerio');
//var S = require('string');
var theWebSeries = require('./thewatchseries');
var swipePager;
var flowPlayer = null;
//var domain = "Thewatchseries.to";
function playEpisode(domain) {

    theWebSeries.play(domain)
        .then(function (url) {
            swipePager.slide(3);
            //$("#v-player").empty();
            //$("#v-player").append("<source src='" + url + "' type='video/mp4'>");
            var clips = [];
            url.forEach(function (el) {
                clips.push(
                    {
                        type: 'video/mp4',
                        src: el
                    }
                );
            });
            console.log(url);
            if (!flowPlayer) {
                console.log("initializing flowplayer");
                flowPlayer = flowplayer(document.getElementById("d-player"), {
                    playlist: [
                        {
                            sources: clips
                        }
                    ]
                });
            } else {
                flowPlayer.addPlaylistItem({sources: clips});
                flowPlayer.next();
            }

        })
        .catch(function (error) {
            console.log(error.stack);
        });
}
function loadEpisode(url) {
    console.log(url);

    theWebSeries.loadEpisode(url)
        .then(function (result) {
            swipePager.slide(2);
            $("#d-episode").empty();
            console.log(result);

            Object.keys(result).forEach(function (key, index) {
                console.log(key);
                $("#d-episode").append("<p><a href='javascript:void(0)' url='" + key + "'>" + key + "</a></p>");
            });
            $("#d-episode a").on("click", function (e) {
                e.preventDefault();
                playEpisode($(this).attr('url'));
            //$("#d-episode a").each("click", function (e) {
            //    e.preventDefault();
            //    playEpisode($(this).attr('url'));
            });


        })
        .catch(function (error) {
            console.log(error);
        });
}

function loadSeries(url) {

    theWebSeries.loadSeries(url)
        .then(function (result) {
            swipePager.slide(1);
            $('#t-episodes').empty();

            Object.keys(result).forEach(function (key, index) {
                $('#t-episodes').append("<tr class='tr-season'><td>" + key + "</td></tr>");
                for (var i = 1; i <= result[key].episodes.length; i++) {
                    $('#t-episodes').append("<tr><td class='td-season'><a class='a-episode' href='javascript:void(0)' url='" + theWebSeries.root + result[key].episodes[i] + "'>Episode " + i + "</a></td></tr>");
                }

            });
            $('#t-episodes a').on("click", function (e) {
                e.preventDefault();
                loadEpisode($(this).attr('url'));
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

$(document).ready(function () {
    //'use strict';
    swipePager = new Swipe(document.getElementById("d-pager"), {
        startSlide: 2,
        speed: 400,
        continuous: false,
        disableScroll: true,
        stopPropagation: true
    });
    $("#f-search").on("submit", function (e) {
        console.log("searching");
        e.preventDefault();

        theWebSeries.search($("#i-search-text").val())
            .then(function (result) {
                swipePager.slide(0);
                $("#u-search-list").empty();
                console.log("resolved");
                //console.log(result);

                Object.keys(result).forEach(function (key, index) {
                    $("#u-search-list").append("<li><a class='series' href='javascript:void(0)' url='" + theWebSeries.root + key + "'>" + key + "</a></li>");
                });
                $("#u-search-list a.series").on("click", function (e) {
                    console.log("link clicked");
                    e.preventDefault();
                    loadSeries($(this).attr('url'));
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    });
});
