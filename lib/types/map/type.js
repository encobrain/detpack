/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../base');

function MapType (properties) {
    base.Type.call(this);
}

MapType.prototype = new base.Type();
MapType.prototype.constructor = MapType;

function setOpts (opts) {
    throw new Error('Map type cant have options');
}

function setListOpts (value) {

}

MapType.prototype.setOpts = setOpts;
MapType.prototype.setListOpts = setListOpts;

module.exports = {
    Type: MapType
};
