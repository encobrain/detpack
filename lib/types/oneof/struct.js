/**
 * Created by Encobrain on 01.11.16.
 */

var fnGen = require('generate-function'),

    base = require('../base'),
    MapType = require('../map/type').Type,
    OneofType = require('../oneof/type').Type
    ;

function OneofStruct (name) {
    base.Struct.call(this, name);
}

OneofStruct.prototype = Object.create(base.Struct.prototype);
OneofStruct.prototype.constructor = OneofStruct;

function arrayDiffFirstKey (arr1, arr2) {
    var diff = {}, i = arr1.length;

    while (i--) diff[arr1[i]] = 1;

    i = arr2.length;

    while (i--) if (!diff[arr2[i]]) return arr2[i];
}


function compileStruct (types, options) {
    var self = this,
        staticMap = null,
        typesMap = null
        ;

    function setOptions (i) {
        var prop = self.props[i];

        prop.setCompilerOptions(options);

        if (prop.value == null)
            throw new Error('Incorrect value in '+prop.structName+'['+prop.index+']');
    }

    function collect (i) {
        var prop = self.props[i];

        if (prop.type === 'STATIC') {
            staticMap = staticMap || {};

            if (staticMap[prop.value])
                throw new Error('Value "'+prop.value+'" in '+prop.structName+'['+prop.index+'] already exists in struct');

            staticMap[prop.value] = prop.index;

            return;
        }

        typesMap = typesMap || {};

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
                var v = map[key];

                if (typeof v === 'number') {
                    var vPropKeys = types[self.props[v].name].requiredKeys,
                        next = key === '$' ? map : {};

                    var diffKey = arrayDiffFirstKey(keys, vPropKeys);

                    if (diffKey == null)
                        throw new Error('Equal required props in "' + self.props[v].name +
                            '" & "' + prop.name + '" structs for "' + prop.structName + '" struct');

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

        compare(typesMap);
    }

    self.props.forEach(setOptions).forEach(collect);

    var indexFn = fnGen()('function indexFn (obj) {');

    if (typesMap) {

        function iter (map) {
            var ret = '';

            function add (key) {
                var i = map[key];

                ret += (ret ? ':' : '') +
                    (key === '$' ?  i :
                    '"'+key+'" in obj ? ' + (typeof i === 'number' ? i : iter(i)));
            }

            Object.keys(map).forEach(add);

            if (!ret) ret = 'null';

            return ret;
        }

        indexFn('if (obj != null && typeof obj === "object") return %s;', iter(typesMap));
    }

    if (staticMap) indexFn('return staticMap[obj];');

    indexFn = indexFn('}').toFunction({
        staticMap: staticMap
    });

    function onlyMaps (val) {
        return val instanceof MapType ? val : null;
    }

    return new OneofType(self.props.map(onlyMaps), indexFn);
}

OneofStruct.prototype.compile = compileStruct;

module.exports = {
    Struct: OneofStruct
}