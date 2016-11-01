/**
 * Created by Encobrain on 31.10.16.
 */

var fs = require('fs'),

    BaseStruct = require('../types/_base').Struct,
    parser = require('../parser')
    ;


function compileFile (pathfile, options, cb) {
    if (!cb) {
        cb = options;
        options = {};
    }

    fs.readFile(pathfile, readed);

    function readed (err, buf) {
        if (err) return cb(err);

        try {
            cb(null, compileText(buf.toString(), options));
        } catch (err) {
            cb(err);
        }

    }
}

function compileText (text, options) {
    options = options || {};

    var structs = parser.parse(text);

    function compile (name) {
        var struct = structs[name];

        if (struct instanceof BaseStruct) throw new Error('Unknown struct "'+struct.constructor.name+'"');

        structs[name] = struct.compile(options);
    }

    Object.keys(structs).forEach(compile);

    return structs;
}


module.exports = {
    compileFile: compileFile,
    compileText: compileText
};
