/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

function BinType () {
    BaseType.call(this);
}

function encode (bin, buffer) {
    if (!buffer) buffer = this.getBuffer(bin);

    var bl = Buffer.byteLength(bin);

    if (bl < this.lenMin)
        throw new Error('Incorrect Bin value. Required minimum ' + this.lenMin + ' bytes');

    if (bl > this.lenMax)
        throw new Error('Incorrect Bin value. Allow max ' + this.lenMax + ' bytes');

    uint.encode(bl, buffer);

    if (Buffer.isBuffer(bin)) buffer.offset += bin.copy(buffer, buffer.offset, 0, bl);
    else buffer.offset += buffer.write(bin, buffer.offset, bl);

    return buffer;
}

function encodeList (bins, buffer) {
    if (!buffer) buffer = this.getBuffer(bins);

    var k = 0, length = bins.length, bin, bl;

    if (length < this.listMin)
        throw new Error('Incorrect Bin list. Required minimum ' + this.listMin + ' Bin values');

    if (length > this.listMax)
        throw new Error('Incorrect Bin list. Allow maximum ' + this.listMax + ' Bin values');

    uint.encode(length, buffer);

    while (k < length) {
        bin = bins[k++];
        bl = Buffer.byteLength(bin);

        if (bl < this.lenMin)
            throw new Error('Incorrect Bin value. Required minimum ' + this.lenMin + ' bytes');

        if (bl > this.lenMax)
            throw new Error('Incorrect Bin value. Allow max ' + this.lenMax + ' bytes');

        uint.encode(bl, buffer);

        if (Buffer.isBuffer(bin)) buffer.offset += bin.copy(buffer, buffer.offset, 0, bl);
        else buffer.offset += buffer.write(bin, buffer.offset, bl);
    }

    return buffer;
}

function checkDefault (bin, propDesc) {
    var len = Buffer.byteLength(bin);

    if (len < this.lenMin)
        throw new Error('Incorrect default. Required minimum ' + this.lenMin + ' bytes in ' + propDesc);

    if (len > this.lenMax)
        throw new Error('Incorrect default. Allow max ' + this.lenMax + ' bytes in ' + propDesc);
}

function checkDefaultList (bins, propDesc) {
    var length = bins.length;

    if (length < this.listMin)
        throw new Error('Incorrect Bin default. Required minimum ' + this.listMin + ' Bin values in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect Bin default. Allow maximum ' + this.listMax + ' Bin values in ' + propDesc);

    while (length--) {
        length = Buffer.byteLength(bins[length]);

        if (length < this.lenMin)
            throw new Error('Incorrect Bin default. Required minimum ' + this.lenMin + ' bytes in ' + propDesc + '['+length+']');

        if (length > this.lenMax)
            throw new Error('Incorrect Bin default. Allow max ' + this.lenMax + ' bytes in ' + propDesc + '['+length+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var bl = uint.decode(buffer, 1),
        bin = new Buffer(bl);

    if (bl) buffer.offset += buffer.copy(bin, 0, buffer.offset, buffer.offset + bl);

    return bin;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0, bins = new Array(length), bin, bl;

    while (k < length) {
        bl = uint.decode(buffer, 1);
        bins[k++] = bin = new Buffer(bl);

        if (bl) buffer.index += buffer.copy(bin, 0, buffer.index, buffer.index + bl);
    }

    return bins;
}

function bitsLength (bin) {
    var len = Buffer.byteLength(bin);

    return uint.bitsLength(len) + (len << 3);
}

function bitsLengthList (bins) {
   var length = bins.length,
       len = uint.bitsLength(length),
       bl
       ;

    while (length--) {
        bl = Buffer.byteLength(bins[length]);

        len += uint.bitsLength(bl) + (bl << 3);
    }

    return len;
}

function setOpts (opts, propDesc) {
    if (opts.length === 1) opts.unshift(0);

    var min = this.lenMin = +opts[0];

    if (min != min || min < 0)
        throw new Error('Incorrect 1st type option in ' + propDesc);

    var max = opts[1];

    if (max != null) {
        if (max != max || max < min)
            throw new Error('Incorrect 2nd type option in ' + propDesc);
    }

    this.lenMax = max || Number.MAX_VALUE;
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


BinType.prototype = new BaseType();
BinType.prototype.constructor = BinType;

BinType.prototype.lenMin = 0;
BinType.prototype.lenMax = Number.MAX_VALUE;
BinType.prototype.listMin = null;
BinType.prototype.listMax = null;

BinType.prototype.encode = encode;
BinType.prototype.decode = decode;
BinType.prototype.bitsLength = bitsLength;

BinType.prototype.setOpts = setOpts;
BinType.prototype.setListOpts = setListOpts;
BinType.prototype.checkDefault = checkDefault;

module.exports = {
    Type: BinType
};
