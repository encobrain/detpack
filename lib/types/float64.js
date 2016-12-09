/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    MIN = NaN,
    MAX = NaN;

function Float64Type () {
    BaseType.call(this, null, 'Float64');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number < this._min || number > this._max)
        throw new Error(this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

    buffer._offset = buffer.writeDoubleLE(+number, buffer._offset, true);

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0, length = numbers.length;

    this._listUint.encode(length, buffer);

    var i = buffer._offset, number;

    while (k < length) {
        number = +numbers[k++];

        if (number < this._min || number > this._max)
            throw new Error(this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

        i = buffer.writeDoubleLE(number, i, true);
    }

    buffer._offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number < this._min  || number > this._max)
        throw new Error('Default '+this.errorTextType+' out of bounds: '+number+' ['+this._min+','+this._max+'] in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length, number;

    this._listUint.checkDefault(length, propDesc);

    while (length--) {
        number = numbers[length];

        if (number < this._min  || number > this._max)
            throw new Error('Default '+this.errorTextType+' out of bounds: '+number+' ['+this._min+','+this._max+'] in ' + propDesc);
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number = buffer.readDoubleLE(buffer._offset, false);

    if (number < this._min || number > this._max)
        throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

    buffer._offset += 8;

    return number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = this._listUint.decode(buffer, 1),
        k = 0, numbers = new Array(length),
        i = buffer._offset,
        number;

    while (k < length) {
        number = buffer.readDoubleLE(i, false);

        if (number < this._min || number > this._max)
            throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

        numbers[k++] = number;

        i += 8;
    }

    buffer._offset = i;

    return numbers;
}

function bitsLength (number) {
    return 64;
}

function bitsLengthList (numbers) {
    return this._listUint.bitsLength(numbers.length) + (numbers.length << 6);
}

function setOpts (opts) {
    if (opts.length < 2) opts.unshift(null);

    var min = this._min = opts[0];

    if (min != null) {
        min = +min;

        if (min != min)
            throw new Error('Incorrect '+this.errorTextType+' 1st option in '+ propDesc);
    }

    this._min = min || MIN;

    var max = opts[1];

    if (max != null) {
        if (max != max || min != null && max < min)
            throw new Error('Incorrect '+this.errorTextType+' 2nd option in ' + propDesc);
    }

    this._max = max || MAX;
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


Float64Type.prototype = new BaseType();
Float64Type.prototype.constructor = Float64Type;

Float64Type.prototype._min = MIN;
Float64Type.prototype._max = MAX;

Float64Type.prototype._listUint = null;

Float64Type.prototype.errorTextType = 'Float64 number';

Float64Type.prototype.encode = encode;
Float64Type.prototype.decode = decode;
Float64Type.prototype.bitsLength = bitsLength;

Float64Type.prototype.setOpts = setOpts;
Float64Type.prototype.setListOpts = setListOpts;
Float64Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Float64Type
};
