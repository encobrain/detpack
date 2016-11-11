/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../base'),
    MapType = require('../map/type').Type,

    defaultTypes = require('../../types')
    ;

function MapStruct (name) {
    base.Struct.call(this, name);
}

MapStruct.prototype = Object.create(base.Struct.prototype);
MapStruct.prototype.constructor = MapStruct;

function compileStruct (types, options) {

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
            defaultValue: prop.default
        };
    }

    function checkDefault (prop) {
        if (prop.defaultValue == null) return;

        prop.type.checkDefault(prop.defaultValue, prop.structName+'.'+prop.name);
    }

    var props = this.props.forEach(setOptions).map(convert).forEach(checkDefault);

    function MapStructType () {
        return new MapType(props);
    }

    return MapStructType;
}

MapStruct.prototype.compile = compileStruct;

module.exports = {
    Struct: MapStruct
};
