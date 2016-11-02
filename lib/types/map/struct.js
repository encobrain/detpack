/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../base');

function MapStruct (name) {
    base.Struct.call(this, name);
}

MapStruct.prototype = Object.create(base.Struct.prototype);
MapStruct.prototype.constructor = MapStruct;

function compileStruct (types, options) {

}

MapStruct.prototype.compile = compileStruct;

module.exports = {
    Struct: MapStruct
};
