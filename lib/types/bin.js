/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

function BinType () {
    BaseType.call(this, null,  'Bin');
}

function encode (bin, buffer) {
    if (!buffer) buffer = this.getBuffer(bin);

    if (!(bin instanceof Buffer))
        throw new Error('Incorrect Binary value: ' + typeof bin);

    this._lenUint.encode(bin.length, buffer);

    buffer._offset += bin.copy(buffer, buffer._offset, 0, bin.length);

    return buffer;
}

function encodeList (bins, buffer) {
    if (!buffer) buffer = this.getBuffer(bins);

    var k = 0, length = bins.length, bin, bl;

    this._listUint.encode(length, buffer);

    while (k < length) {
        bin = bins[k++];

        if (!(bin instanceof Buffer))
            throw new Error('Incorrect Binary value: ' + typeof bin);

        this._lenUint.encode(bin.length, buffer);

        buffer._offset += bin.copy(buffer, buffer._offset, 0, bin.length);
    }

    return buffer;
}

function checkDefault (bin, propDesc) {
    if (!(bin instanceof Buffer))
        throw new Error('Incorrect default Binary value: ' + typeof bin);

    this._lenUint.checkDefault(bin.length, propDesc);
}

function checkDefaultList (bins, propDesc) {
    var length = bins.length, bin;

    this._listUint.checkDefault(length, propDesc);

    while (length--) {
        bin = bins[length];

        if (!(bin instanceof Buffer))
            throw new Error('Incorrect default Binary value in '+propDesc+'['+length+']: ' + typeof bin);

        this._lenUint.checkDefault(bin.length, propDesc+'.'+length);
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var bl = this._lenUint.decode(buffer, 1),
        bin = new Buffer(bl);

    if (bl) buffer.copy(bin, 0, buffer._offset, buffer._offset += bl);

    return bin;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = this._listUint.decode(buffer, 1),
        k = 0, bins = new Array(length), bin, bl;

    while (k < length) {
        bl = this._lenUint.decode(buffer, 1);
        bins[k++] = bin = new Buffer(bl);

        if (bl) buffer.copy(bin, 0, buffer._offset, buffer._offset += bl);
    }

    return bins;
}

function bitsLength (bin) {
    var len = Buffer.byteLength(bin || '');

    return this._lenUint.bitsLength(len) + (len << 3);
}

function bitsLengthList (bins) {
   var length = bins.length,
       len = this._listUint.bitsLength(length),
       bl
       ;

    while (length--) {
        bl = Buffer.byteLength(bins[length] || '');

        len += this._lenUint.bitsLength(bl) + (bl << 3);
    }

    return len;
}

function setOpts (opts, propDesc) {
    this._lenUint.setOpts(opts, propDesc);
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


BinType.prototype = new BaseType();
BinType.prototype.constructor = BinType;

BinType.prototype._lenUint = new UintType();
BinType.prototype._lenUint.errorTextType = 'Binary bytes length';

BinType.prototype._listUint = null;

BinType.prototype.encode = encode;
BinType.prototype.decode = decode;
BinType.prototype.bitsLength = bitsLength;

BinType.prototype.setOpts = setOpts;
BinType.prototype.setListOpts = setListOpts;
BinType.prototype.checkDefault = checkDefault;

module.exports = {
    Type: BinType
};
