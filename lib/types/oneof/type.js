/**
 * Created by Encobrain on 01.11.16.
 */

var fnGen = require('generate-function'),

    BaseType = require('../../base').Type,
    UintType = require('../uint').Type;

function createEncodeFn (oneof) {
    var fn = fnGen(),
        localVars = {
            indexToValue: oneof._indexToValue,
            staticToIndex: oneof._staticToIndex
        };

    fn('function encode (value, buffer){')
      ('    if (!buffer) buffer = this.getBuffer(value);');

    if (oneof._objectToIndex_code) {
        if (oneof._staticToIndex) {
            fn('var i;')
              ('if (value != null && typeof value === "object") {')
              ('    i = %s;', oneof._objectToIndex_code)
              ('    buffer._addIndex(i, %d);', oneof._indexBits)
              ('    indexToValue[i].encode(value, buffer);')
              ('} else {')
              ('    i = staticToIndex[value];')
              ('    if (i == null) throw new Error("Incorrect Oneof value");')
              ('    buffer._addIndex(i, %d);', oneof._indexBits)
              ('}');
        } else {
            fn('var i = %s;', oneof._objectToIndex_code)
              ('buffer._addIndex(i, %d);', oneof._indexBits)
              ('indexToValue[i].encode(value, buffer);');
        }
    } else {
        fn('var i = staticToIndex[value];')
          ('if (i == null) throw new Error("Incorrect Oneof value");')
          ('buffer._addIndex(i, %d);', oneof._indexBits);
    }

    fn('    if (arguments.length === 1) buffer._fixIndex();')
      ('    return buffer;')
      ('}');

    return fn.toFunction(localVars);
}

function createDecodeFn (oneof) {
    var fn = fnGen(),
        localVars = {
            indexToValue: oneof._indexToValue
        };

    fn('function decode (buffer, inited) {')
      ('    if (!inited) this.initBuffer(buffer);')
      ('    var v = indexToValue[ buffer._getIndex(%d) ];', oneof._indexBits);

    if (oneof._objectToIndex_code) {
        if (oneof._staticToIndex) {
            fn('if (typeof v === "object") v = v.decode(buffer,1);')
        } else {
            fn('if (v) v = v.decode(buffer,1);')
        }
    }

    fn('    if (v == null) throw new Error("Decoded Oneof value incorrect");')
      ('    return v;')
      ('}');

    return fn.toFunction(localVars);
}

function createBitsLengthFn (oneof) {
    var fn = fnGen(),
        localVars = {
            staticToIndex: oneof._staticToIndex,
            indexToValue: oneof._indexToValue
        };

    fn('function bitsLength (value) {');

    if (oneof._objectToIndex_code) {
        if (oneof._staticToIndex) {
            fn('return value != null && typeof value === "object" ?')
              ('    %d + indexToValue[ %s ].bitsLength(value) :', oneof._indexBits, oneof._objectToIndex_code)
              ('    %d;', oneof._indexBits);
        } else {
            fn('return %d + indexToValue[ %s ].bitsLength(value);', oneof._indexBits, oneof._objectToIndex_code);
        }
    } else {
        fn('return %d;', oneof._indexBits);
    }

    fn('}');

    return fn.toFunction(localVars);
}

function createCheckDefaultFn (oneof) {
    var fn = fnGen(),
        localVars = {
            indexToValue: oneof._indexToValue,
            staticToIndex: oneof._staticToIndex
        };

    fn('function checkDefault (value, propDesc) {');

    if (oneof._objectToIndex_code) {
        if (oneof._staticToIndex) {
            fn('if (value != null && typeof value === "object")')
              ('    indexToValue[ %s ].checkDefault(value, propDesc);', oneof._objectToIndex_code)
              ('else {')
              ('    var i = staticToIndex[value];')
              ('    if (i == null) throw new Error("Incorrect Oneof default value in " + propDesc);')
              ('}');
        } else {
            fn('indexToValue[ %s ].checkDefault(value, propDesc);', oneof._objectToIndex_code);
        }
    } else {
        fn('var i = staticToIndex[value];')
          ('if (i == null) throw new Error("Incorrect Oneof default value in " + propDesc);')
    }

    fn('}');

    return fn.toFunction(localVars);
}

function mapToCode (map) {
        var ret = '';

        function add (key) {
            var i = map[key];

            ret += (ret ? ':' : '') +
                (key === '$' ?  i :
                '"'+key+'" in value ? ' + (typeof i === 'number' ? i : mapToCode(i)));
        }

        Object.keys(map).forEach(add);

        if (!ret) ret = 'null';

        return ret;
    }

function OneofType (id, name, indexToValue, staticToIndex, objectToIndex) {
    BaseType.call(this, id, name);

    this._indexToValue = indexToValue;
    this._staticToIndex = staticToIndex;

    if (objectToIndex) this._objectToIndex_code = mapToCode(objectToIndex);

    this._indexBits = Math.ceil(Math.log2(indexToValue.length));

    this.encode = createEncodeFn(this);
    this.decode = createDecodeFn(this);
    this.bitsLength = createBitsLengthFn(this);
    this.checkDefault = createCheckDefaultFn(this);
}

function setOpts (opts) {
    throw new Error ('Oneof type cant have options');
}

function createEncodeListFn (oneof) {
    var fn = fnGen(),
        localVars = {
            indexToValue: oneof._indexToValue,
            staticToIndex: oneof._staticToIndex
        };

    fn('function encodeList (values, buffer){')
      ('    if (!buffer) buffer = this.getBuffer(values);')
      ('    var k = 0, length = values.length, value;')
      ('    this._listUint.encode(length, buffer);')
      ('    while (k < length) {')
      ('        value = values[k++];');

    if (oneof._objectToIndex_code) {
        if (oneof._staticToIndex) {
            fn('var i;')
              ('if (value != null && typeof value === "object") {')
              ('    i = %s;', oneof._objectToIndex_code)
              ('    buffer._addIndex(i, %d);', oneof._indexBits)
              ('    indexToValue[i].encode(value, buffer);')
              ('} else {')
              ('    i = staticToIndex[value];')
              ('    if (i == null) throw new Error("Incorrect Oneof value");')
              ('    buffer._addIndex(i, %d);', oneof._indexBits)
              ('}');
        } else {
            fn('var i = %s;', oneof._objectToIndex_code)
              ('buffer._addIndex(i, %d);', oneof._indexBits)
              ('indexToValue[i].encode(value, buffer);');
        }
    } else {
        fn('var i = staticToIndex[value];')
          ('if (i == null) throw new Error("Incorrect Oneof value");')
          ('buffer._addIndex(i, %d);', oneof._indexBits);
    }

    fn('    }')
      ('    if (arguments.length === 1) buffer._fixIndex();')
      ('    return buffer;')
      ('}');

    return fn.toFunction(localVars);
}

function createDecodeListFn (oneof) {
    var fn = fnGen(),
        localVars = {
            indexToValue: oneof._indexToValue
        };

    fn('function decodeList (buffer, inited) {')
      ('    if (!inited) this.initBuffer(buffer);')
      ('    var k=0, length = this._listUint.decode(buffer,1),')
      ('        values = new Array(length);')
      ('    while (k < length) {')
      ('        var v = indexToValue[ buffer._getIndex(%d) ];', oneof._indexBits);

    if (oneof._objectToIndex_code) {
        if (oneof._staticToIndex) {
            fn('if (typeof v === "object") v = v.decode(buffer,1);')
        } else {
            fn('if (v) v = v.decode(buffer,1);')
        }
    }

    fn('        if (v == null) throw new Error("Decoded Oneof value incorrect");')
      ('        values[k++] = v;')
      ('    }')
      ('    return values;')
      ('}');

    return fn.toFunction(localVars);
}

function createBitsLengthListFn (oneof) {
    var fn = fnGen(),
        localVars = {
            staticToIndex: oneof._staticToIndex,
            indexToValue: oneof._indexToValue
        };

    fn('function bitsLengthList (values) {')
      ('    var length = values.length,')
      ('        len = this._listUint.bitsLength(length) + length * %d, value;', oneof._indexBits)
      ('    while (length--) {')
      ('        value = values[length];');

    if (oneof._objectToIndex_code) {
        if (oneof._staticToIndex) {
            fn('if (value != null && typeof value === "object")')
              ('    len += indexToValue[ %s ].bitsLength(value);', oneof._objectToIndex_code)
        } else {
            fn('len += indexToValue[ %s ].bitsLength(value);', oneof._objectToIndex_code);
        }
    }

    fn('    }')
      ('    return len;')
      ('}');

    return fn.toFunction(localVars);
}

function createCheckDefaultListFn (oneof) {
    var fn = fnGen(),
        localVars = {
            indexToValue: oneof._indexToValue,
            staticToIndex: oneof._staticToIndex
        };

    fn('function checkDefaultList (values, propDesc) {')
      ('    var length = values.length, value;')
      ('    while (length--) {')
      ('        value = values[length];');

    if (oneof._objectToIndex_code) {
        if (oneof._staticToIndex) {
            fn('if (value != null && typeof value === "object")')
              ('    indexToValue[ %s ].checkDefault(value, propDesc);', oneof._objectToIndex_code)
              ('else {')
              ('    var i = staticToIndex[value];')
              ('    if (i == null) throw new Error("Incorrect Oneof default value in " + propDesc);')
              ('}');
        } else {
            fn('indexToValue[ %s ].checkDefault(value, propDesc);', oneof._objectToIndex_code);
        }
    } else {
        fn('var i = staticToIndex[value];')
          ('if (i == null) throw new Error("Incorrect Oneof default value in " + propDesc);')
    }

    fn('    }')
      ('}');

    return fn.toFunction(localVars);
}

function setListOpts (opts, propDesc) {
    this._listUint = new UintType();
    this._listUint.errorTextType = 'List count';
    this._listUint.setOpts(opts, propDesc);

    this.encode = createEncodeListFn(this);
    this.decode = createDecodeListFn(this);
    this.bitsLength = createBitsLengthListFn(this);
    this.checkDefault = createCheckDefaultListFn(this);
}

OneofType.prototype = new BaseType();
OneofType.prototype.constructor = OneofType;

OneofType.prototype._indexToValue = null;
OneofType.prototype._staticToIndex = null;
OneofType.prototype._objectToIndex_code = null;
OneofType.prototype._indexBits = null;

OneofType.prototype._listUint = null;

OneofType.prototype.setOpts = setOpts;
OneofType.prototype.setListOpts = setListOpts;

module.exports = {
    Type: OneofType
};
