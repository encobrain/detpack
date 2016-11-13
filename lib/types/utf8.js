/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

function Utf8Type () {
    BaseType.call(this, 'Utf8');
}

function encode (str, buffer) {
    if (!buffer) buffer = this.getBuffer(str);

    if (str.length < this.lenMin)
        throw new Error('Incorrect Utf8 string. Required minimum ' + this.lenMin + ' chars');

    if (str.length > this.lenMax)
        throw new Error('Incorrect Utf8 string. Allow max ' + this.lenMax + ' chars');

    var bl = Buffer.byteLength(str);

    uint.encode(bl, buffer);

    buffer._offset += buffer.write(str, buffer._offset, bl, 'utf8');

    return buffer;
}

function encodeList (strs, buffer) {
    if (!buffer) buffer = this.getBuffer(strs);

    var k = 0, length = strs.length, str, bl;

    if (length < this.listMin)
        throw new Error('Incorrect Utf8 list. Required minimum ' + this.listMin + ' Utf8 strings');

    if (length > this.listMax)
        throw new Error('Incorrect Utf8 list. Allow maximum ' + this.listMax + ' Utf8 strings');

    uint.encode(length, buffer);

    while (k < length) {
        str = strs[k++];


        if (str.length < this.lenMin)
            throw new Error('Incorrect Utf8 string. Required minimum ' + this.lenMin + ' chars');

        if (str.length > this.lenMax)
            throw new Error('Incorrect Utf8 string. Allow max ' + this.lenMax + ' chars');

        bl = Buffer.byteLength(str);

        uint.encode(bl, buffer);

        buffer._offset += buffer.write(str, buffer._offset, bl, 'utf8');
    }

    return buffer;
}

function checkDefault (str, propDesc) {
    if (typeof str !== 'string')
        throw new Error('Incorrect default type in ' + propDesc);

    if (str.length < this.lenMin)
        throw new Error('Incorrect default. Required minimum ' + this.lenMin + ' chars in ' + propDesc);

    if (str.length > this.lenMax)
        throw new Error('Incorrect default. Allow max ' + this.lenMax + ' chars in ' + propDesc);
}

function checkDefaultList (strs, propDesc) {
    var length = strs.length, len;

    if (length < this.listMin)
        throw new Error('Incorrect Bin default. Required minimum ' + this.listMin + ' Utf8 strings in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect Bin default. Allow maximum ' + this.listMax + ' Utf8 strings in ' + propDesc);

    while (length--) {
        if (typeof strs[length] !== 'string')
            throw new Error('Incorrect default type in ' + propDesc + '['+length+']');

        len = strs[length].length;

        if (len < this.lenMin)
            throw new Error('Incorrect Bin default. Required minimum ' + this.lenMin + ' chars in ' + propDesc + '['+length+']');

        if (len > this.lenMax)
            throw new Error('Incorrect Bin default. Allow max ' + this.lenMax + ' chars in ' + propDesc + '['+length+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var bl = uint.decode(buffer, 1);

    return buffer.toString('utf8', buffer._offset, buffer._offset += bl);
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0, strs = new Array(length),
        i = buffer._offset, bl;

    while (k < length) {
        bl = uint.decode(buffer, 1);
        strs[k++] = buffer.toString('utf8', i, i += bl);
    }

    buffer._offset = i;

    return strs;
}

function bitsLength (str) {
    var len = Buffer.byteLength(str, 'utf8');

    return uint.bitsLength(len) + (len << 3);
}

function bitsLengthList (strs) {
   var length = strs.length,
       len = uint.bitsLength(length),
       bl
       ;

    while (length--) {
        bl = Buffer.byteLength(strs[length], 'utf8');

        len += uint.bitsLength(bl) + (bl << 3);
    }

    return len;
}

function setOpts (opts, propDesc) {
    if (opts.length < 2) opts.unshift(0);

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

    this.encode = encodeList;
    this.decode = decodeList;
    this.bitsLength = bitsLengthList;
    this.checkDefault = checkDefaultList;
}


Utf8Type.prototype = new BaseType();
Utf8Type.prototype.constructor = Utf8Type;

Utf8Type.prototype.lenMin = 0;
Utf8Type.prototype.lenMax = Number.MAX_VALUE;
Utf8Type.prototype.listMin = null;
Utf8Type.prototype.listMax = null;

Utf8Type.prototype.encode = encode;
Utf8Type.prototype.decode = decode;
Utf8Type.prototype.bitsLength = bitsLength;

Utf8Type.prototype.setOpts = setOpts;
Utf8Type.prototype.setListOpts = setListOpts;
Utf8Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Utf8Type
};
