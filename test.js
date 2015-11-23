/**
 * Created by sarowar on 9/24/15.
 */

var fs = require("fs");
var cheerio = require("cheerio");
var S = require("string");
var JSOL= require("./lib/jsol");

console.log("hello");
var data = fs.readFileSync("data.html");
var doc = cheerio.load(data);
doc("script").each(function (index, el) {
    var text = S(cheerio(el).text()).trim();
    var str;
    if (text.startsWith('jwplayer("flvplayer").setup({')) {
        console.log(text.s);
        str = text.substring(text.indexOf("{"), text.indexOf("var vvplay;"));
        str = str.substring(0, str.lastIndexOf("}") + 1);
        console.log(str.s);
        //TODO: NEED TO IMPLEMENT NICER WAY
        //eval()
        str=str.replaceAll("\n","");
        //var json = JSOL.parse(str.s);
        eval("var eobj="+str.s);
        console.log(eobj.file);
    }


})