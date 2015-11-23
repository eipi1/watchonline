/**
 * Created by sarowar on 9/15/15.
 */

var fs = require('fs');
var path = require('path');

var plugins = {};

function loadPlugins(dir) {
    fs.lstat(dir, function (err, stat) {
        if (stat.isDirectory()) {
            // we have a directory: do a tree walk
            fs.readdir(dir, function (err, files) {
                var f, l = files.length;
                for (var i = 0; i < l; i++) {
                    f = path.join(dir, files[i]);
                    loadPlugins(f);
                }
            });
        } else {
            console.log(dir);
            if (dir !== __filename){
                // we have a file: load it
                console.log("importing: "+dir);
                require(dir)(plugins);
            }
        }
    });
}
loadPlugins(__dirname);

exports.plugins = plugins;