/**
 * Created by Encobrain on 31.10.16.
 */

var BaseType = require('./_base').Type;

function MapProp () {}

MapProp.prototype.name = null;
MapProp.prototype.typeName = null;
MapProp.prototype.typeOpts = null;
MapProp.prototype.listOpts = null;
MapProp.prototype.default = null;

function MapStruct () {

}

function MapType () {
    BaseType.call(this);
}

MapType.prototype = new BaseType();
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