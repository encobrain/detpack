/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../base');

function MapStruct () {
    base.Struct.call(this);
}

MapStruct.prototype = new base.Struct();
MapStruct.prototype.constructor = MapStruct;

function compileStruct (types, options) {

}

MapStruct.prototype.compile = compileStruct;

module.exports = {
    Struct: MapStruct
};
