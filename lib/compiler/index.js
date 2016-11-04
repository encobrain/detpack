/**
 * Created by Encobrain on 31.10.16.
 */

var fs = require('fs'),

    base = require('../base'),
    parser = require('../parser')
    ;


function compileFile (pathfile, options, cb) {
    if (!cb) {
        cb = options;
        options = null;
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

    var structs = parser.parse(text), types={};

    function compile (name) {
        var struct = structs[name];

        if (struct instanceof base.Struct) throw new Error('Unknown struct "'+struct.constructor.name+'"');

        types[name] = struct.compile(types, options);
    }

    Object.requiredKeys(structs).forEach(compile);

    return types;
}


module.exports = {
    Option: require('./option').Option,
    compileFile: compileFile,
    compileText: compileText
};
