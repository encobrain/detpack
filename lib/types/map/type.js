/**
 * Created by Encobrain on 01.11.16.
 */

var fnGen = require('generate-function'),

    BaseType = require('../../base').Type,
    UintType = require('../uint').Type,

    uint = new UintType()
    ;

function getPropName (name) {
    if (name[0] >= '0' && name[0] <= '9') return '["'+name+'"]';

    return '.'+name;
}

function createEncodeFn (props) {
    var fn = fnGen();

    fn('function encode (map, buffer) {')
      ('    if (!buffer) buffer = this.getBuffer(map);')
      ('    var v;');

    var localVars = {};

    function add (prop) {
        var $name = '$'+prop.name;

        localVars[$name] = prop.type;

        fn('v = map%s;', getPropName(prop.name));

        if (prop.defaultValue) {
            fn('if (v == null) {')
              ('    buffer._addIndex(0,1);')
              ('} else {')
              ('    buffer._addIndex(1,1);')
              ('    %s.encode(v, buffer);', $name)
              ('}');
        } else {
            fn('if (v == null) throw new Error(".%s is required");', prop.name)
              ('%s.encode(v, buffer);', $name);
        }
    }

    props.forEach(add);

    fn('    if (arguments.length === 1) buffer._fixIndex();')
      ('    return buffer;')
      ('}');

    return fn.toFunction(localVars);
}

function createEncodeListFn (props) {
    var fn = fnGen();

    var localVars = {
        uint: uint
    };

    fn('function encodeList (maps, buffer) {')
      ('    if (!buffer) buffer = this.getBuffer(maps);')
      ('    var k=0, length = maps.length, map, v;')
      ('    if (length < this.listMin)')
      ('        throw new Error("Incorrect Map list. Required minimum " + this.listMin + " Map objects");')
      ('    if (length > this.listMax)')
      ('        throw new Error("Incorrect Map list. Allow maximum " + this.listMax + " Map objects");')
      ('    uint.encode(length, buffer);')
      ('    while (k < length) {')
      ('        map = maps[k++];');

    function add (prop) {
        var $name = '$'+prop.name;

        localVars[$name] = prop.type;

        fn('v = map%s;', getPropName(prop.name));

        if (prop.defaultValue) {
            fn('if (v == null) {')
            ('    buffer._addIndex(0,1);')
            ('} else {')
            ('    buffer._addIndex(1,1);')
            ('    %s.encode(v, buffer);', $name)
            ('}');
        } else {
            fn('if (v == null) throw new Error(".%s is required");', prop.name)
            ('%s.encode(v, buffer);', $name);
        }
    }

    props.forEach(add);

    fn('    }')
      ('}');

    return fn.toFunction(localVars);
}

function createDecodeFn (props) {
    var fn = fnGen();

    fn('function decode (buffer, inited) {')
      ('    if (!inited) this.initBuffer(buffer);')
      ('    var map = {');

    var localVars = {};

    function add (prop) {
        var $name = '$'+prop.name;

        localVars[$name] = prop.type;

        if (prop.defaultValue) {
            fn('%s : buffer._getIndex(1) ?', prop.name)
              ('    %s.decode(buffer,1) :', $name)
              ('    %s,', JSON.stringify(prop.defaultValue));
        } else {
            fn('%s : %s.decode(buffer,1),', prop.name, $name);
        }
    }

    props.forEach(add);

    fn('    __type__: this.name')
      ('    };')
      ('    return map;')
      ('}');

    return fn.toFunction(localVars);
}

function createDecodeListFn (props) {
    var fn = fnGen();

    fn('function decodeList (buffer, inited) {')
      ('    if (!inited) this.initBuffer(buffer);');

    var localVars = {
        uint: uint
    };

    fn('    var k=0, length = uint.decode(buffer,1),')
      ('        maps = new Array(length);')
      ('    while (k < length) {')
      ('        maps[k++] = {');

    function add (prop) {
        var $name = '$'+prop.name;

        localVars[$name] = prop.type;

        if (prop.defaultValue) {
            fn('%s : buffer._getIndex(1) ?', prop.name)
            ('    %s.decode(buffer,1) :', $name)
            ('    %s,', JSON.stringify(prop.defaultValue));
        } else {
            fn('%s : %s.decode(buffer,1),', prop.name, $name);
        }
    }

    props.forEach(add);

    fn('        __type__: this.name')
      ('        };')
      ('    }')
      ('    return maps;')
      ('}');

    return fn.toFunction(localVars);
}

function createCheckDefaultFn (props) {
    var fn = fnGen();

    fn('function checkDefault (map, propDesc) {')
      ('    var v;');

    var localVars = {};

    function add (prop) {
        var $name = '$' + prop.name;

        localVars[$name] = prop.type;

        fn('v = map%s', getPropName(prop.name));

        if (prop.defaultValue) {
            fn('if (v != null) %s.checkDefault(v, propDesc + ".%s");', $name, prop.name);
        } else {
            fn('if (v == null) throw new Error(".%s is required in " + propDesc);', prop.name)
              ('%s.checkDefault(v, propDesc + ".%s");', $name, prop.name);
        }
    }

    props.forEach(add);

    fn('}');

    return fn.toFunction(localVars);
}

function createCheckDefaultListFn (props) {
    var fn = fnGen();

    fn('function checkDefaultList (maps, propDesc) {')
      ('    var length = maps.length, map, v;')
      ('    if (length < this.listMin)')
      ('        throw new Error("Incorrect default Map list. Required minimum " + this.listMin + " Map objects");')
      ('    if (length > this.listMax)')
      ('        throw new Error("Incorrect default Map list. Allow maximum " + this.listMax + " Map objects");')
      ('    while (length--) {')
      ('        map = maps[length];')

    var localVars = {};

    function add (prop) {
        var $name = '$' + prop.name;

        localVars[$name] = prop.type;

        fn('v = map%s', getPropName(prop.name));

        if (prop.defaultValue) {
            fn('if (v != null) %s.checkDefault(v, propDesc + ".%s"', $name, prop.name);
        } else {
            fn('if (v == null) throw new Error(".%s is required in " + propDesc);', prop.name)
            ('%s.checkDefault(v, propDesc + ".%s");', $name, prop.name);
        }
    }

    props.forEach(add);

    fn('    }')
      ('}');

    return fn.toFunction(localVars);
}

function createBitsLengthFn (props) {
    var fn = fnGen();

    function countDefaults (count, prop) {
        return count + prop.defaultValue ? 1 : 0;
    }

    fn('function bitsLength (map) {')
      ('    var v, len = %d;', props.reduce(countDefaults, 0));

    var localVars = {};

    function add (prop) {
        var $name = '$' + prop.name;

        localVars[$name] = prop.type;

        if (prop.defaultValue) {
            fn('v = map%s;', getPropName(prop.name))
              ('if (v != null) len += %s.bitsLength(v);', $name);
        } else {
            fn('len += %s.bitsLength(map%s);', $name, getPropName(prop.name));
        }
    }

    props.forEach(add);

    fn('    return len;')
      ('}');

    return fn.toFunction(localVars);
}

function createBitsLengthListFn (props) {
    var fn = fnGen();

    function countDefaults (count, prop) {
        return count + prop.defaultValue ? 1 : 0;
    }

    var localVars = {
        uint: uint
    };

    fn('function bitsLengthList (maps) {')
      ('    var k=0, length = maps.length,')
      ('        len = uint.bitsLength(length) + %d * length, map, v;', props.reduce(countDefaults, 0))
      ('    while (k < length) {')
      ('        map = maps[k++];');

    function add (prop) {
        var $name = '$' + prop.name;

        localVars[$name] = prop.type;

        if (prop.defaultValue) {
            fn('v = map%s;', getPropName(prop.name))
            ('if (v != null) len += %s.bitsLength(v);', $name);
        } else {
            fn('len += %s.bitsLength(map%s);', $name, getPropName(prop.name));
        }
    }

    props.forEach(add);

    fn('    }')
      ('    return len;')
      ('}');

    return fn.toFunction(localVars);
}


function MapType (name, properties) {
    BaseType.call(this, name);

    this.props = properties;

    var reqKeys = this.requiredKeys = [];

    function addRequired (prop) {
        if (prop.defaultValue == null) reqKeys.push(prop.name);
    }

    properties.forEach(addRequired);

    this.encode = createEncodeFn(properties);
    this.decode = createDecodeFn(properties);
    this.checkDefault = createCheckDefaultFn(properties);
    this.bitsLength = createBitsLengthFn(properties);
}

function setOpts (opts) {
    throw new Error('Map type cant have options');
}

function setListOpts (opts, propDesc) {
    if (opts.length < 2) opts.unshift(0);

    var min = this.listMin = +opts[0];

    if (min != min || min < 0)
        throw new Error('Incorrect 1st list option in ' + propDesc);

    var max = opts[1];

    if (max != null) {
        if (max != max || max < min)
            throw new Error('Incorrect 2nd list option in ' + propDesc);
    }

    this.listMax = max || Number.MAX_VALUE;

    this.encode = createEncodeListFn(this.props);
    this.decode = createDecodeListFn(this.props);
    this.bitsLength = createBitsLengthListFn(this.props);
    this.checkDefault = createCheckDefaultListFn(this.props);
}

MapType.prototype = new BaseType();
MapType.prototype.constructor = MapType;

MapType.prototype.props = null;
MapType.prototype.requiredKeys = null;

MapType.prototype.listMin = null;
MapType.prototype.listMax = null;

MapType.prototype.setOpts = setOpts;
MapType.prototype.setListOpts = setListOpts;

module.exports = {
    Type: MapType
};
