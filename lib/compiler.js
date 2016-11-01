/**
 * Created by Encobrain on 31.10.16.
 */

var fs = require('fs'),

    OneofStruct = require('./types/oneof').Struct,
    MapStruct = require('./types/map').Struct,
    parser = require('./parser')
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

function compileMapStruct (struct, options) {

}

function compileOneofStruct (struct, options) {

}

function compileText (text, options) {
    var structs = parser.parse(text);

    function compile (name) {
        var struct = structs[name];

        switch (struct.constructor) {
            case OneofStruct:
                structs[name] = compileOneofStruct(struct, options);
                break;

            case MapStruct:
                structs[name] = compileMapStruct(struct, options);
                break;

            default: throw new Error('Unknown struct "'+struct.constructor.name+'"');
        }
    }



    Object.keys(structs).forEach(compile);

    return structs;
}


module.exports = {
    compileFile: compileFile,
    compileText: compileText
};
