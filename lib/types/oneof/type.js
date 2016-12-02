/**
 * Created by Encobrain on 01.11.16.
 */

var BaseType = require('../../base').Type;

function OneofType (name, indexFn, values) {
    BaseType.call(this, name);

    this._values = values;
    this._indexFn = indexFn;
    this._indexBits = Math.ceil(Math.log2(values.length));
}

function encode (value, buffer) {
    if (!buffer) buffer = this.getBuffer(value);

    var i = this._indexFn(value);

    if (i == null)
        throw new Error('Incorrect Oneof value');

    buffer._addIndex(i, this._indexBits);

    i = this._values[i];

    if (i instanceof BaseType) i.encode(value, buffer);

    if (arguments.length === 1) buffer._fixIndex();

    return buffer;
}

function encodeList (values, buffer) {
    if (!buffer) buffer = this.getBuffer(values);

    var k = 0,
        length = values.length,
        value, i;

    this._listUint.encode(length, buffer);

    while (k < length) {
        value = values[k++];

        i = this._indexFn(value);

        if (i == null)
            throw new Error('Incorrect Oneof value');

        buffer._addIndex(i, this._indexBits);

        i = this._values[i];

        if (i instanceof BaseType) i.encode(value, buffer);
    }


    if (arguments.length === 1) buffer._fixIndex();

    return buffer;
}

function checkDefault (value, propDesc) {
    var i = this._indexFn(value);

    if (i == null)
        throw new Error('Incorrect Oneof default value in ' + propDesc);

    var v = this._values[i];

    if (v instanceof BaseType) v.checkDefault(value, propDesc);
}

function checkDefaultList (values, propDesc) {
    var length = values.length,
        value, i, v;

    this._listUint.checkDefault(length, propDesc);

    while (length--) {
        value = values[length];
        i = this._indexFn(value);

        if (i == null)
            throw new Error('Incorrect default Oneof value in ' + propDesc + '.'+length);

        v = this._values[i];

        if (v instanceof BaseType) v.checkDefault(value, propDesc + '.' + length);
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var v = this._values[ buffer._getIndex(this._indexBits) ];

    if (v instanceof BaseType) v = v.decode(buffer, 1);

    if (v == null)
        throw new Error('Decoded Oneof value incorrect');

    return v;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var k = 0, length = uint.decode(buffer, 1),
        values = new Array(length), v;

    while (k < length) {
        v = this._values[ buffer._getIndex(this._indexBits) ];

        if (v instanceof BaseType) v = v.decode(buffer, 1);

        if (v == null)
            throw new Error('Decoded Oneof value incorrect');

        values[k++] = v;
    }

    return values;
}

function bitsLength (value) {
    var v = this._values[ this._indexFn(value) ];

    return v instanceof BaseType ? this._indexBits + v.bitsLength(value) : this._indexBits;
}

function bitsLengthList (values) {
    var length = values.length,
        len = uint.bitsLength(length) + length * this._indexBits,
        value, v;

    while (length--) {
        value = values[length];
        v = this._values[ this._indexFn(value) ];
        if (v instanceof BaseType) len += v.bitsLength(value);
    }

    return len;
}

function setOpts (opts) {
    throw new Error ('Oneof type cant have options');
}

function setListOpts (opts, propDesc) {
    this._listUint = new UintType();
    this._listUint.errorTextType = 'List count';
    this._listUint.setOpts(opts, propDesc);

    this.encode = encodeList;
    this.decode = decodeList;
    this.bitsLength = bitsLengthList;
    this.checkDefault = checkDefaultList;
}

OneofType.prototype = new BaseType();
OneofType.prototype.constructor = OneofType;

OneofType.prototype._values = null;
OneofType.prototype._indexFn = null;
OneofType.prototype._indexBits = null;

OneofType.prototype._listUint = null;

OneofType.prototype.setOpts = setOpts;
OneofType.prototype.setListOpts = setListOpts;
OneofType.prototype.encode = encode;
OneofType.prototype.decode = decode;
OneofType.prototype.bitsLength = bitsLength;

module.exports = {
    Type: OneofType
};
