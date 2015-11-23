/**
 * Created by sarowar on 9/14/15.
 */
var url = require('url');
var Promise = require('bluebird');
var cheerio = require('cheerio');
var S = require('string');

var vodlocker = {};
var domain = "vodlocker.com";
var urlPath = "";

function validateDomain(urlString) {
    var urlObj = url.parse(urlString);
    if (domain !== urlObj.host) {
        return false;
    }
    urlPath = urlObj.pathname.substr(1);
    return true;
}

function findJsonObj(string) {

}

vodlocker.getFileUrl = function (urlString) {
    return new Promise(function (resolve, reject) {
        if (!validateDomain(urlString)) {
            return reject(Error("Mismatched domain"));
        }
        var embedUrl = "http://" + domain + "/embed-" + urlPath + "-640x360.html";
        $.ajax({
            timeout: 3000,
            url: embedUrl,
            dataType: "html"
        }).then(function (data) {
            //console.log(data);

            var returned = false;
            var doc = cheerio.load(data);
            var scripts = doc("script");//.each(function (index, el) {
            for (var i = 0; i < scripts.length; i++) {
                var el = scripts[i];
                var text = S(cheerio(el).text()).trim();
                var str;
                if (text.startsWith('jwplayer("flvplayer").setup({')) {
                    //console.log(text.s);
                    str = text.substring(text.indexOf("{"), text.indexOf("var vvplay;"));
                    str = str.substring(0, str.lastIndexOf("}") + 1);
                    //console.log(str.s);
                    //TODO: NEED TO IMPLEMENT SAFER/NICER WAY
                    str = str.replaceAll("\n", "");
                    eval("var eobj=" + str.s);
                    returned = true;
                    console.log("file url found");
                    return resolve(eobj.file);
                    //console.log("shouldn't print");
                }
            }//);
            //console.log("shouldn't print2");
            if (!returned) {
                console.log("testing");
                return reject(Error("File Url Not Found"));
            }

        }, function (error) {
            return reject(error);
        });
    });
}

module.exports = function (plugins) {
    console.log(plugins);
    if (!plugins['videoservices']) {
        plugins['videoservices'] = {};
    }
    plugins['videoservices'][domain] = vodlocker;
    console.log(plugins);
}