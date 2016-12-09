/**
 * Created by Encobrain on 01.11.16.
 */

var BaseStruct = require('../../base/struct').Struct,
    MapType = require('../map/type').Type,

    defaultTypes = require('../../types')
    ;

function MapStruct (name) {
    BaseStruct.call(this, name);
}

MapStruct.prototype = new BaseStruct();
MapStruct.prototype.constructor = MapStruct;

function createType (id, types, options) {
    var self = this;

    function setOptions (prop) {
        prop.setCompilerOptions(options);
    }

    function convert (prop) {

        var type = types[prop.typeName] || defaultTypes[prop.typeName];

        if (!type)
            throw new Error('Unknown type "'+prop.typeName+'" in "'+prop.structName+'.'+prop.name+'" property');

        type = new type();

        if (prop.typeOpts) type.setOpts(prop.typeOpts, prop.structName+'.'+prop.name);

        if (prop.listOpts) type.setListOpts(prop.listOpts, prop.structName+'.'+prop.name);

        return {
            type: type,
            name: prop.name,
            structName: prop.structName,
            defaultValue: prop.default
        };
    }

    function checkDefault (prop) {
        if (prop.defaultValue == null || prop.defaultValue === false) return;

        prop.type.checkDefault(prop.defaultValue, prop.structName+'.'+prop.name);
    }

    this.props.forEach(setOptions)

    var props = this.props.map(convert);

    props.forEach(checkDefault);

    function MapStructType () {
        return new MapType(id, self.name, props);
    }

    return MapStructType;
}

MapStruct.prototype.createType = createType;

module.exports = {
    Struct: MapStruct
};
