/**
 * Created by Encobrain on 01.11.16.
 */

var BaseStruct = require('../../base/struct').Struct,
    MapType = require('../map/type').Type,
    OneofType = require('../oneof/type').Type
    ;

function OneofStruct (name) {
    BaseStruct.call(this, name);
}

OneofStruct.prototype = new BaseStruct();
OneofStruct.prototype.constructor = OneofStruct;

function arrayDiffFirstKey (arr1, arr2) {
    var diff = {}, i = arr1.length;

    while (i--) diff[arr1[i]] = 1;

    i = arr2.length;

    while (i--)
        if (!diff[arr2[i]]) return arr2[i];
        else delete diff[arr2[i]];

    for (i in diff) return i;
}


function createType (types, options) {
    var self = this,
        staticToIndex = null,
        objectToIndex = null
        ;

    function setOptions (prop) {
        prop.setCompilerOptions(options);

        if (prop.type === 'STATIC' && prop.value == null)
            throw new Error('Incorrect value in '+prop.structName+'['+prop.index+']');
    }

    function collect (prop) {
        if (prop.type === 'STATIC') {
            staticToIndex = staticToIndex || {};

            if (staticToIndex[prop.value])
                throw new Error('Value "'+prop.value+'" in '+prop.structName+'['+prop.index+'] already exists in struct');

            staticToIndex[prop.value] = prop.index;

            return;
        }

        objectToIndex = objectToIndex || {};

        //          {}
        //
        // a b c 1  {$:1}
        //
        //   b c 2  {a:1,$:2}
        //
        // a b   3  {a:{c:1,$:3},$:2}
        //
        // a   c 4  {a:{c:{b:1,$:4},$:3},$:2}
        //
        // a     5  {a:{c:{b:1,$:4},b:3,$:5},$:2}
        //   b   6  {a:{c:{b:1,$:4},b:3,$:5},c:2,$:6}
        //     c 7  {a:{c:{b:1,$:4},b:3,$:5},c:{b:2,$:7},$:6}
        //
        // i = a ? c ? b ? 1 : 4 : b ? 3 : 5 : c ? b ? 2 : 7 : 6;

        var type = types[prop.name];

        if (!type) throw new Error('Unknown type "'+prop.name+'" in "'+prop.structName+'" struct');

        if (!(type instanceof MapType)) throw new Error('Incorrect type "'+prop.name+'" in "'+prop.structName+'" struct');

        var keys = type.requiredKeys;

        function compare (map) {

            function check (key) {
                if (key !== '$' && keys.indexOf(key) < 0) return;

                var v = map[key];

                if (typeof v === 'number') {
                    var vPropKeys = types[self.props[v].name].requiredKeys,
                        next = key === '$' ? map : {};

                    var diffKey = arrayDiffFirstKey(keys, vPropKeys);

                    if (diffKey == null)
                        throw new Error('Required props in "' + self.props[v].name +
                            '" & "' + prop.name + '" structs are equal for "' + prop.structName + '" struct');

                    delete next.$; // $ must be always last

                    if (vPropKeys.indexOf(diffKey) >= 0) {
                        next[diffKey] = v;
                        next.$ = prop.index;
                    } else {
                        next[diffKey] = prop.index;
                        next.$ = v;
                    }

                    if (next !== map) map[key] = next;

                    return true;
                }

                if (keys.indexOf(key) >= 0) return compare(v);
            }

            if (!Object.keys(map).some(check)) map.$ = prop.index;
        }

        compare(objectToIndex);
    }

    self.props.forEach(setOptions);
    self.props.forEach(collect);

    function getValue (prop) {
        return prop.type === 'STATIC' ? prop.value : types[prop.name]();
    }

    var values = self.props.map(getValue);

    function OneofStructType () {
        return new OneofType(self.name, values, staticToIndex, objectToIndex);
    }

    return OneofStructType;
}

OneofStruct.prototype.createType = createType;

module.exports = {
    Struct: OneofStruct
}