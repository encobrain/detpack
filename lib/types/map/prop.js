/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../../base');

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

module.exports = {
    Prop: MapProp
};
