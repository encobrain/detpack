/**
 * Created by Encobrain on 31.10.16.
 */

var fs = require('fs'),

    BaseStruct = require('../base/struct').Struct,
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

function compileFileSync (pathfile, options) {
    var buf = fs.readFileSync(pathfile);

    return compileText(buf.toString(), options);
}

function compileText (text, options) {
    options = options || {};

    var structs = parser.parse(text.toString()), types={}, idToType={};

    function compile (name) {
        var struct = structs[name];

        if (!(struct instanceof BaseStruct)) throw new Error('Unknown struct "'+struct.constructor.name+'"');

        var type = struct.createType(types, options);

        types[name] = type;

        type = new type();

        idToType[type.id] = type;
    }

    Object.keys(structs).forEach(compile);

    function decode (buffer) {
        var id = buffer[0],
            type = idToType[id];

        if (!type) throw new Error('Incorrect buffer data');

        return type.decode(buffer);
    }

    types.decode = decode;

    return types;
}


module.exports = {
    Option: require('./option').Option,
    compileFile: compileFile,
    compileFileSync: compileFileSync,
    compileText: compileText
};
