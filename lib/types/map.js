/**
 * Created by Encobrain on 31.10.16.
 */

var BaseType = require('./_base').Type;

function MapType () {
    BaseType.call(this);
}

MapType.prototype = new BaseType();
MapType.prototype.constructor = MapType;

function MapParseDefaultValue (text, i, newError) {

}

function isCorrectOpts (opts) {

}

MapType.prototype.parseDefaultValue = MapParseDefaultValue;
MapType.prototype.isCorrectOpts = isCorrectOpts;

function MapProp () {}

MapProp.prototype.name = null;
MapProp.prototype.typeName = null;
MapProp.prototype.typeOpts = null;
MapProp.prototype.listOpts = null;
MapProp.prototype.default = null;


module.exports = {
    Type: MapType,
    Property: MapProp
};