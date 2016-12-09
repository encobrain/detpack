/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type;

var MIN = -0x80,
    MAX = 0x80-1,
    UMAX = 0x100
    ;

function Int8Type () {
    BaseType.call(this, null, 'Int8');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number)
        throw new Error('Incorrect '+this.errorTextType+': '+number);

    if (number < this._min  || number > this._max)
        throw new Error(this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

    buffer[buffer._offset++] = number & 0xFF;

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0, length = numbers.length, number;

    this._listUint.encode(length, buffer);

    var i = buffer._offset;

    while (k < length) {
        number = +numbers[k++];

        if (number != number)
            throw new Error('Incorrect '+this.errorTextType+': '+number);

        if (number < this._min  || number > this._max)
            throw new Error(this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

        buffer[i++] = number & 0xFF;
    }

    buffer._offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number)
        throw new Error('Incorrect default '+this.errorTextType+': '+number+' in ' + propDesc);

    if (number < this._min  || number > this._max)
        throw new Error('Default '+this.errorTextType+' out of bounds: '+number+' ['+this._min+','+this._max+'] in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    this._listUint.checkDefault(length);

    while (length--) {
        number = +numbers[length];

        if (number != number)
            throw new Error('Incorrect default '+this.errorTextType+': '+number+' in ' + propDesc);

        if (number < this._min  || number > this._max)
            throw new Error('Default '+this.errorTextType+' out of bounds: '+number+' ['+this._min+','+this._max+'] in ' + propDesc);
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number = buffer[buffer._offset++];

    if (number >= 0x80) number-=UMAX;

    if (number < this._min || number > this._max)
        throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

    return number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = this._listUint.decode(buffer, 1),
        k = 0, numbers = new Array(length),
        i = buffer._offset, number;

    while (k < length) {
        number = buffer[i++];

        if (number>=0x80) number-=UMAX;

        if (number < this._min || number > this._max)
            throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

        numbers[k++] = number;
    }

    buffer._offset = i;

    return numbers;
}

function bitsLength (number) {
    return 8;
}

function bitsLengthList (numbers) {
    return this._listUint.bitsLength(numbers.length) + (numbers.length << 3);
}

function setOpts (opts, propDesc) {
    if (opts.length < 2) opts.unshift(0);

    var min = this._min = +opts[0];

    if (min != min || min < MIN)
        throw new Error('Incorrect '+this.errorTextType+' 1st option in '+ propDesc);

    var max = opts[1];

    if (max != null) {
        if (max != max || max < min || max > MAX)
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


Int8Type.prototype = new BaseType();
Int8Type.prototype.constructor = Int8Type;

Int8Type.prototype._min = MIN;
Int8Type.prototype._max = MAX;

Int8Type.prototype._listUint = null;

Int8Type.prototype.errorTextType = 'Int8 number';

Int8Type.prototype.encode = encode;
Int8Type.prototype.decode = decode;
Int8Type.prototype.bitsLength = bitsLength;

Int8Type.prototype.setOpts = setOpts;
Int8Type.prototype.setListOpts = setListOpts;
Int8Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Int8Type
};
