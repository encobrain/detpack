/**
 * Created by Encobrain on 31.10.16.
 */

var BaseType = require('./_base').Type;

function MapType () {
    BaseType.call(this);
}

MapType.prototype = new BaseType();

function MapParseDefaultValue (text, i, newError) {

}

function isCorrectOpts (opts) {

}

MapType.prototype.parseDefaultValue = MapParseDefaultValue;
MapType.prototype.isCorrectOpts = isCorrectOpts;

function MapProperty () {}

MapProperty.prototype.name = null;
MapProperty.prototype.typeName = null;
MapProperty.prototype.typeOpts = null;
MapProperty.prototype.listOpts = null;
MapProperty.prototype.default = null;


module.exports = {
    Type: MapType,
    Property: MapProperty
};