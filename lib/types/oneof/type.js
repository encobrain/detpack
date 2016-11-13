/**
 * Created by Encobrain on 01.11.16.
 */

var BaseType = require('../../base').Type;

function OneofType (indexFn, values) {
    BaseType.call(this);

    this.values = values;
    this.indexFn = indexFn;
    this.indexBits = Math.ceil(Math.log2(values.length));
}

function encode (value, buffer) {
    if (!buffer) buffer = this.getBuffer(value);

    var i = this.indexFn(value);

    if (i == null)
        throw new Error('Incorrect Oneof value');

    buffer.addIndex(i, this.indexBits);

    i = this.values[i];

    if (i instanceof BaseType) i.encode(value, buffer);

    if (arguments.length === 1) buffer.fixIndex();

    return buffer;
}

function encodeList (values, buffer) {
    if (!buffer) buffer = this.getBuffer(value);

    var k = 0, length = values.length,
        value, i;

    uint.encode(length, buffer);

    while (k < length) {
        value = values[k++];

        i = this.indexFn(value);

        if (i == null)
            throw new Error('Incorrect Oneof value');

        buffer.addIndex(i, this.indexBits);

        i = this.values[i];

        if (i instanceof BaseType) i.encode(value, buffer);
    }


    if (arguments.length === 1) buffer.fixIndex();

    return buffer;
}

function checkDefault (value, propDesc) {
    var i = this.indexFn(value);

    if (i == null)
        throw new Error('Incorrect Oneof default value in ' + propDesc);

    var v = this.values[i];

    if (v instanceof BaseType) v.checkDefault(value, propDesc);
}

function checkDefaultList (values) {
    var length = values.length,
        value, i, v;

    if (length < this.listMin)
        throw new Error('Incorrect Oneof list default. Required minimum ' + this.listMin + ' Oneof values in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect Oneof list. Allow maximum ' + this.listMax + ' Oneof values in ' + propDesc);

    while (length--) {
        value = values[length];
        i = this.indexFn(value);

        if (i == null)
            throw new Error('Incorrect Oneof default value in ' + propDesc + '.'+length);

        v = this.values[i];

        if (v instanceof BaseType) v.checkDefault(value, propDesc + '.' + length);
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var v = this.values[ buffer.getIndex(this.indexBits) ];

    if (v instanceof BaseType) v = v.decode(buffer, 1);

    return v;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var k = 0, length = uint.decode(buffer, 1),
        values = new Array(length), v;

    while (k < length) {
        v = this.values[ buffer.getIndex(this.indexBits) ];
        if (v instanceof BaseType) v = v.decode(buffer, 1);
        values[k++] = v;
    }

    return values;
}

function bitsLength (value) {
    var v = this.values[ this.indexFn(value) ];

    return this.indexBits + (v instanceof BaseType ? v.bitsLength(value) : 0);
}

function bitsLengthList (values) {
    var length = values.length,
        len = uint.bitsLength(length) + length * this.indexBits,
        value, v;

    while (length--) {
        value = values[length];
        v = this.values[ this.indexFn(value) ];
        if (v instanceof BaseType) len += v.bitsLength(value);
    }

    return len;
}

function setOpts (opts) {
    throw new Error ('Oneof type cant have options');
}

function setListOpts (opts, propDesc) {
    if (opts.length === 1) opts.unshift(0);

    var min = this.listMin = +opts[0];

    if (min != min || min < 0)
        throw new Error('Incorrect 1st list option in ' + propDesc);

    var max = opts[1];

    if (max != null) {
        if (max != max || max < min)
            throw new Error('Incorrect 2nd list option in ' + propDesc);
    }

    this.listMax = max || Number.MAX_VALUE;

    this.encode = encodeList;
    this.decode = decodeList;
    this.bitsLength = bitsLengthList;
    this.checkDefault = checkDefaultList;
}

OneofType.prototype = new BaseType();
OneofType.prototype.constructor = OneofType;

OneofType.prototype.values = null;
OneofType.prototype.indexFn = null;
OneofType.prototype.indexBits = null;

OneofType.prototype.listMin = null;
OneofType.prototype.listMax = null;

OneofType.prototype.setOpts = setOpts;
OneofType.prototype.setListOpts = setListOpts;
OneofType.prototype.encode = encode;
OneofType.prototype.decode = decode;
OneofType.prototype.bitsLength = bitsLength;

module.exports = {
    Type: OneofType
};
