/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../base'),

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

        var Type = types[prop.typeName] || defaultTypes[prop.typeName];

        if (!Type)
            throw new Error('Unknown type "'+prop.typeName+'" in "'+prop.structName+'.'+prop.name+'" property');

        if (prop.typeOpts) Type.setOpts(prop.typeOpts, prop.structName+'.'+prop.name);

        if (prop.listOpts) Type.setListOpts(prop.listOpts, prop.structName+'.'+prop.name);

        return {
            type: Type,
            name: prop.name,
            defaultValue: prop.default
        };
    }

    function checkDefault (prop) {
        if (prop.defaultValue == null) return;

        prop.type.checkDefault(prop.defaultValue);
    }

    var props = this.props.forEach(setOptions).map(convert).forEach(checkDefault);

    return new MapType(props);
}

MapStruct.prototype.compile = compileStruct;

module.exports = {
    Struct: MapStruct
};
