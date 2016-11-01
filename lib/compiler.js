/**
 * Created by Encobrain on 31.10.16.
 */

var fs = require('fs'),

    OneofStruct = require('./types/oneof').Struct,
    MapStruct = require('./types/map').Struct,
    parser = require('./parser')
    ;


function compileFile (pathfile, cb) {
    fs.readFile(pathfile, readed);

    function readed (err, buf) {
        if (err) return cb(err);

        try {
            cb(null, compileText(buf.toString()));
        } catch (err) {
            cb(err);
        }

    }
}

function compileMapStruct (struct) {

}

function compileOneofStruct (struct) {

}

function compileText (text) {
    var structs = parser.parse(text);

    function compile (name) {
        var struct = structs[name];

        switch (struct.constructor) {
            case OneofStruct:
                structs[name] = compileOneofStruct(struct);
                break;

            case MapStruct:
                structs[name] = compileMapStruct(struct);
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
