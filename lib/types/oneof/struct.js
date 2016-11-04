/**
 * Created by Encobrain on 01.11.16.
 */


var base = require('../base'),
    MapType = require('../map/type').Type
    ;

function OneofStruct (name) {
    base.Struct.call(this, name);
}

OneofStruct.prototype = Object.create(base.Struct.prototype);
OneofStruct.prototype.constructor = OneofStruct;

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

        // a b c 1  {a:1}
        //
        //   b c 2  {a:1,b:2}
        //
        // a b   3  {a:{b:{c:1,_:3}},b:2}
        //
        // a   c 4  {a:{b:{c:1,_:3},_:4},b:2}
        //
        // a     5  {a:{b:{c:1,_:3},c:4,_:5},b:2}
        //   b   6  {a:{b:{c:1,_:3},c:4,_:5},b:{c:2,_:6}}
        //     c 7  {a:{b:{c:1,_:3},c:4,_:5},b:{c:2,_:6},_:7}}
        //
        // i = a ? b ? c ? 1 : 3 : c ? 4 : 5 : b ? c ? 2 : 6 : 7;

        var type = types[prop.name];

        if (!type) throw new Error('Unknown type "'+prop.name+'" in "'+prop.structName+'" struct');

        if (!(type instanceof MapType)) throw new Error('Incorrect type "'+prop.name+'" in "'+prop.structName+'" struct');

        var reqKeys = type.requiredKeys;

        reqKeys.some();
    }

    self.props.forEach(setOptions).forEach(collect);




}

OneofStruct.prototype.compile = compileStruct;

module.exports = {
    Struct: OneofStruct
}