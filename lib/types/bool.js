/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

function BoolType () {
    BaseType.call(this, 'Bool');
}

function encode (bool, buffer) {
    if (!buffer) buffer = this.getBuffer(bool);

    buffer._addIndex(bool ? 1 : 0, 1);

    if (arguments.length === 1) buffer._fixIndex();

    return buffer;
}

function encodeList (bools, buffer) {
    if (!buffer) buffer = this.getBuffer(bools);

    var bi=0, length = bools.length;

    this._listUint.encode(length, buffer);

    var i = buffer._offset, byte = 0;

    while (bi < length) {
        byte = bools[bi++] ? (byte << 1) | 1 : byte << 1;

        if (!(bi & 7)) {
            buffer[i++] = byte;
            byte = 0;
        }
    }

    if (bi &= 7) buffer[i++] = byte << (8 - bi);

    buffer._offset = i;

    return buffer;
}

function checkDefault (bool, propDesc) {

}

function checkDefaultList (bools, propDesc) {
    this._listUint.checkDefault(bools.length, propDesc);
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    return !!buffer._getIndex(1);
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = this._listUint.decode(buffer, 1),
        bools = new Array(length),
        bi = 0, i = buffer._offset,
        byte;

    while (bi < length) {
        if (!(bi & 7)) byte = buffer[i++];

        bools[bi++] = !!(byte & 0x80);
        byte <<= 1;
    }

    buffer._offset = i;

    return bools;
}

function bitsLength (bool) {
    return 1;
}

function bitsLengthList (bools) {
    return this._listUint.bitsLength(bools.length) + bools.length + ((8 - bools.length & 7) & 7);
}

function setOpts () {
    throw new Error('Bool type cant have options');
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


BoolType.prototype = new BaseType();
BoolType.prototype.constructor = BoolType;

BoolType.prototype._listUint = null;

BoolType.prototype.encode = encode;
BoolType.prototype.decode = decode;
BoolType.prototype.bitsLength = bitsLength;

BoolType.prototype.setOpts = setOpts;
BoolType.prototype.setListOpts = setListOpts;
BoolType.prototype.checkDefault = checkDefault;

module.exports = {
    Type: BoolType
};
