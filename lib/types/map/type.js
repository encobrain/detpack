/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../base');

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
    Type: MapType
};
