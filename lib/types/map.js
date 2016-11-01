/**
 * Created by Encobrain on 31.10.16.
 */

var base = require('../base');

function MapProp () {
    base.Prop.call(this);
}

function setCompilerOptions (options) {

}

MapProp.prototype = new base.Prop();
MapProp.prototype.constructor = MapProp;

MapProp.prototype.name = null;
MapProp.prototype.typeName = null;
MapProp.prototype.typeOpts = null;
MapProp.prototype.listOpts = null;
MapProp.prototype.default = null;

MapProp.prototype.setCompilerOptions = setCompilerOptions;

function MapStruct () {
    base.Struct.call(this);
}

MapStruct.prototype = new base.Struct();
MapStruct.prototype.constructor = MapStruct;

function compileStruct (options) {

}

MapStruct.prototype.compile = compileStruct;

function MapType () {
    base.Type.call(this);
}

MapType.prototype = new base.Type();
MapType.prototype.constructor = MapType;

function isCorrectDefaultValue (value) {

}

function isCorrectOpts (opts) {

}

MapType.prototype.isCorrectDefaultValue = isCorrectDefaultValue;
MapType.prototype.isCorrectOpts = isCorrectOpts;

module.exports = {
    Property: MapProp,
    Struct: MapStruct,
    Type: MapType
};