/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

function BoolType () {
    BaseType.call(this);
}

function encode (bool, buffer) {
    if (!buffer) buffer = this.getBuffer(bool);

    buffer.addIndex(bool ? 1 : 0, 1);

    if (arguments.length === 1) buffer.fixIndex();

    return buffer;
}

function encodeList (bools, buffer) {
    if (!buffer) buffer = this.getBuffer(bools);

    var bi=0, length = bools.length;

    uint.encode(length, buffer);

    var i = buffer.offset, byte = 0;

    while (bi < length) {
        byte = bools[bi++] ? (byte << 1) | 1 : byte << 1;

        if (!(bi & 7)) {
            buffer[i++] = byte;
            byte = 0;
        }
    }

    if (bi &= 7) buffer[i++] = byte << (8 - bi);

    buffer.offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {

}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Bool values in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Bool values in ' + propDesc);
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    return buffer.getIndex(1) ? true : false;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        bools = new Array(length),
        bi = 0, i = buffer.index,
        byte;

    while (bi < length) {
        if (!(bi & 7)) byte = buffer[i++];

        bools[bi++] = byte & 0x80 ? true : false;
        byte <<= 1;
    }

    buffer.offset = i;

    return bools;
}

function bitsLength (bool) {
    return 1;
}

function bitsLengthList (bools) {
    return uint.bitsLength(bools.length) + bools.length + ((8 - bools.length & 7) & 7);
}

function setOpts (opts) {
    throw new Error('Bool type cant have options');
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


BoolType.prototype = new BaseType();
BoolType.prototype.constructor = BoolType;

BoolType.prototype.listMin = null;
BoolType.prototype.listMax = null;

BoolType.prototype.encode = encode;
BoolType.prototype.decode = decode;
BoolType.prototype.bitsLength = bitsLength;

BoolType.prototype.setOpts = setOpts;
BoolType.prototype.setListOpts = setListOpts;
BoolType.prototype.checkDefault = checkDefault;

module.exports = {
    Type: BoolType
};
