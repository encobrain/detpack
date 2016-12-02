/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType(),

    MIN = 0,
    MAX = Number.MAX_VALUE
    ;

function Utf8Type () {
    BaseType.call(this, 'Utf8');
}

function encode (str, buffer) {
    if (typeof str !== 'string')
        throw new Error('Incorrect Utf8: ' + typeof str);

    if (!buffer) buffer = this.getBuffer(str);

    if (str.length < this._lenMin  || str.length > this._lenMax)
        throw new Error('Utf8 chars length out of bounds: '+str.length+'['+this._lenMin+','+this._lenMax+']');

    var bl = Buffer.byteLength(str);

    uint.encode(bl, buffer);

    buffer._offset += buffer.write(str, buffer._offset, bl, 'utf8');

    return buffer;
}

function encodeList (strs, buffer) {
    if (!buffer) buffer = this.getBuffer(strs);

    var k = 0, length = strs.length, str, bl;

    this._listUint.encode(length, buffer);

    while (k < length) {
        str = strs[k++];

        if (typeof str !== 'string')
            throw new Error('Incorrect Utf8: ' + typeof str);

        if (str.length < this._lenMin  || str.length > this._lenMax)
            throw new Error('Utf8 chars length out of bounds: '+str.length+'['+this._lenMin+','+this._lenMax+']');

        bl = Buffer.byteLength(str);

        uint.encode(bl, buffer);

        buffer._offset += buffer.write(str, buffer._offset, bl, 'utf8');
    }

    return buffer;
}

function checkDefault (str, propDesc) {
    if (typeof str !== 'string')
        throw new Error('Incorrect default Utf8 in ' + propDesc);

    if (str.length < this._lenMin  || str.length > this._lenMax)
        throw new Error('Default Utf8 chars length out of bounds: '+str.length+'['+this._lenMin+','+this._lenMax+']');
}

function checkDefaultList (strs, propDesc) {
    var length = strs.length, str, len;

    this._listUint.checkDefault(length, propDesc);

    while (length--) {
        str = sts[length];

        if (str !== 'string')
            throw new Error('Incorrect default Utf8 in ' + propDesc + '['+length+']');

        if (str.length < this._lenMin  || str.length > this._lenMax)
            throw new Error('Default Utf8 chars length out of bounds: '+str.length+'['+this._lenMin+','+this._lenMax+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var bl = uint.decode(buffer, 1),
        str = buffer.toString('utf8', buffer._offset, buffer._offset += bl);

    if (str.length < this._lenMin || str.length > this._lenMax)
        throw new Error('Decoded Utf8 chars length out of bounds: '+str.length+'['+this._lenMin+','+this._lenMax+']');

    return str;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = this._listUint.decode(buffer, 1),
        k = 0, strs = new Array(length),
        bl, str;

    while (k < length) {
        bl = uint.decode(buffer, 1);
        str = buffer.toString('utf8', buffer._offset, buffer._offset += bl);

        if (str.length < this._lenMin || str.length > this._lenMax)
            throw new Error('Decoded Utf8 chars length out of bounds: '+str.length+'['+this._lenMin+','+this._lenMax+']');

        strs[k++] = str;
    }

    return strs;
}

function bitsLength (str) {
    var len = Buffer.byteLength(str || '', 'utf8');

    return uint.bitsLength(len) + (len << 3);
}

function bitsLengthList (strs) {
   var length = strs.length,
       len = uint.bitsLength(length),
       bl
       ;

    while (length--) {
        bl = Buffer.byteLength(strs[length] || '', 'utf8');

        len += uint.bitsLength(bl) + (bl << 3);
    }

    return len;
}

function setOpts (opts, propDesc) {
    if (opts.length < 2) opts.unshift(0);

    var min = this._lenMin = +opts[0];

    if (min != min || min < MIN)
        throw new Error('Incorrect Utf8 1st type option in ' + propDesc);

    var max = opts[1];

    if (max != null) {
        if (max != max || max < min || max > MAX)
            throw new Error('Incorrect Utf8 2nd type option in ' + propDesc);
    }

    this._lenMax = max || MAX;
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


Utf8Type.prototype = new BaseType();
Utf8Type.prototype.constructor = Utf8Type;

Utf8Type.prototype._lenMin = MIN;
Utf8Type.prototype._lenMax = MAX;

Utf8Type.prototype._listUint = null;

Utf8Type.prototype.encode = encode;
Utf8Type.prototype.decode = decode;
Utf8Type.prototype.bitsLength = bitsLength;

Utf8Type.prototype.setOpts = setOpts;
Utf8Type.prototype.setListOpts = setListOpts;
Utf8Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Utf8Type
};
