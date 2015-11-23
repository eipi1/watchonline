/**
 * Created by sarowar on 9/11/15.
 */
'use strict';

var Promise = require('bluebird');
var util = require('util');
var cheerio = require('cheerio');
var S = require('string');
var plugins = require('./lib/plugins/plugins').plugins;

function TheWatchSeries() {
}

TheWatchSeries.prototype = {
    domain: "thewatchseries.to",
    root: "http://thewatchseries.to",
    searchUrl: "http://thewatchseries.to/search/%s",
    showData: {},
    currentEpisodeNum: {},
    currentEpisodeData: {}
};

TheWatchSeries.prototype.search = function (url) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var furl = util.format(self.searchUrl, url),
            result = {};
        $.ajax({
            url: furl,
            dataType: "html"
        }).then(function (data, status, xhr) {

            var doc = cheerio.load(data);
            doc('a').each(function (d, element) {
                //console.log(el);
                var href = cheerio(element).attr('href'),
                    el = cheerio(element),
                    sibling;
                if (S(href).startsWith("/serie/")) {
                    console.log(el);
                    //$("#u-search-list").append("<a href='"+domain+cheerio(el).attr('href')+"'>"+cheerio(el).attr("href")+"</a>");
                    //result[href].url = self.root + href;
                    if (!result[href]) {
                        result[href] = {};
                        result[href].url = self.root + href;
                    }
                    if (el.children('img').length == 1) {
                        result[href].img = el.children('img').attr('src');
                    } else {
                        sibling = el.siblings('strong');
                        if (cheerio(sibling[0]).text() == "Description:") {
                            result[href].desc = sibling[0].next.data;
                        }
                    }
                }
            });
            //console.log(result);
            resolve(result);
            //console.log(data);
            //var html = $(data);
            //html.find('a').each(function (d,el) {
            //    console.log(el)
            //});
        }, function (xhr, status, error) {
            reject(error);
        });
    });
};

TheWatchSeries.prototype.loadSeries = function (url) {
    var self = this;
    return new Promise(function (resolve, reject) {
        console.log("loading series " + url);
        var result = {};
        $.ajax({
            url: url,
            dataType: "html"
        }).then(function (data) {
            var doc = cheerio.load(data);
            var seasons = doc('div .fullwrap').find("div[itemprop='season']");
            console.log(seasons);
            seasons.each(function (d, el) {
                var element = cheerio(el);
                //if (element.attr('itemprop') === 'season') {
                //    console.log(element);
                //}
                var name = element.children('h2').find("span[itemprop='name']").text();
                if (!result[name]) {
                    result[name] = {};
                }
                result[name].url = element.children('h2').children('a').attr('href');
                result[name].episodes = [];
                element.children('ul.listings').children('li').each(function (d, el) {
                    result[name].episodes[cheerio(el).children("meta[itemprop='episodenumber']").attr('content')] = cheerio(el).children("meta[itemprop='url']").attr('content');
                });
                self.showData = result;
            });
            console.log(self.showData);
            return resolve(result);
        }, function (xhr, status, error) {
            reject(error);
        });
    });
};

TheWatchSeries.prototype.loadEpisode = function (url) {
    var self = this;
    self.currentEpisodeNum.season = (url.substring(url.lastIndexOf("_s") + 2, url.lastIndexOf("_"))).valueOf();
    self.currentEpisodeNum.episode = (url.substring(url.lastIndexOf("_e") + 2, url.lastIndexOf("."))).valueOf();

    return new Promise(function (resolve, reject) {
        var result = {},
            doc;
        $.ajax({
            url: url,
            dataType: "html"
        }).then(function (data) {
            doc = cheerio.load(data);
            doc('#myTable a.buttonlink').each(function (index, el) {
                if (!result[cheerio(el).attr('title')])
                    result[cheerio(el).attr('title')] = [];
                var base64str = cheerio(el).attr('href');
                base64str = base64str.substring(base64str.lastIndexOf('?r=') + 3);
                base64str = new Buffer(base64str, 'base64').toString('utf-8');
                result[cheerio(el).attr('title')].push(base64str);
                self.currentEpisodeData = result;
                resolve(result);
            })
        }, function (xhr, status, error) {
            reject(error);
        })
    });
}

TheWatchSeries.prototype.play = function (service) {
    var self = this;
    //return new Promise(function (resolve, reject) {
        var urls = [];
        var counter = 0;
        if (!plugins['videoservices'][service]) {
            reject(Error("Video service is not available."))
        }

        var servicePlugin = plugins['videoservices'][service];

        var furls = self.currentEpisodeData[service].map(function (data) {
            return servicePlugin.getFileUrl(data);
        });
        return Promise.settle(furls)
            .then(function (result) {
                var r, error;
                for (var i = 0; i < result.length; i++) {
                    r = result[i];
                    if (r.isFulfilled()) {
                        urls.push(r.value());
                        console.log(r.value());
                    } else if (r.isRejected()) {
                        error= r.reason();
                    }
                }
                return urls;
            })
            .catch(function (error) {
                console.log(error);
            });

        /*
         self.currentEpisodeData[service].forEach(function (data, index) {
         servicePlugin.getFileUrl(data)
         .then(function (url) {
         urls.push(url);
         counter++;
         if (self.currentEpisodeData[service].length === counter) {
         return resolve(urls);
         }
         })
         .catch(function (error) {
         if (self.currentEpisodeData[service].length === index) {
         if(urls.length !== 0)
         return resolve(urls);
         else
         return reject(error);
         }
         });
         });
         */
        //if(url.length){
        //    return resolve(url);
        //}else{
        //    return reject(Error("No Url Found."))
        //}
    //});
}

module.exports = new TheWatchSeries();