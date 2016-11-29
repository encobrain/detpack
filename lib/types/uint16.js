/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType(),

    MIN = 0,
    MAX = 0x10000
    ;


function Uint16Type () {
    BaseType.call(this, 'Uint16');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number)
        throw new Error('Incorrect '+this.errorTextType+': '+number);

    if (number < this._min  || number >= this._max)
        throw new Error(this.errorTextType+' out of bounds: ' + number + '['+this._min+','+this._max+')');

    buffer[buffer._offset++] = number & 0xFF;
    buffer[buffer._offset++] = number >> 8;

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

        if (number < this._min  || number >= this._max)
            throw new Error(this.errorTextType+' out of bounds: ' + number + '['+this._min+','+this._max+')');

        buffer[i++] = number & 0xFF;
        buffer[i++] = number >> 8;
    }

    buffer._offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number)
        throw new Error('Incorrect default '+this.errorTextType+': '+number+' in ' + propDesc);

    if (number < this._min  || number >= this._max)
        throw new Error('Default '+this.errorTextType+' out of bounds: '+number+' ['+this._min+','+this._max+') in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    this._listUint.checkDefault(length);

    while (length--) {
        number = +numbers[length];

        if (number != number)
            throw new Error('Incorrect default '+this.errorTextType+': '+number+' in ' + propDesc);

        if (number < this._min  || number >= this._max)
            throw new Error('Default '+this.errorTextType+' out of bounds: '+number+' ['+this._min+','+this._max+') in ' + propDesc);
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number = buffer[++buffer._offset] * 256;

    number += buffer[buffer._offset++ - 1];

    if (number < this._min || number >= this._max)
        throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+')');

    return number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = this._listUint.decode(buffer, 1),
        k = 0,
        numbers = new Array(length),
        i = buffer._offset,
        number
        ;

    while (k < length) {
        number = buffer[++i] * 256;
        number += buffer[i++ - 1]; // need sep count

        if (number < this._min || number >= this._max)
            throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+')');

        numbers[k++] = number;
    }

    buffer._offset = i;

    return numbers;
}

function bitsLength (number) {
    return 16;
}

function bitsLengthList (numbers) {
    return this._listUint.bitsLength(numbers.length) + (numbers.length << 4);
}

function setOpts (opts, propDesc) {
    if (opts.length < 2) opts.unshift(0);

    var min = this._min = +opts[0];

    if (min != min || min < 0)
        throw new Error('Incorrect '+this.errorTextType+' 1st option in '+ propDesc);

    var max = opts[1];

    if (max != null) {
        if (max != max || max < min || max > MAX)
            throw new Error('Incorrect '+this.errorTextType+' 2nd option in ' + propDesc);
    }

    this._max = max || TEN;
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

Uint16Type.prototype = new BaseType();
Uint16Type.prototype.constructor = Uint16Type;

Uint16Type.prototype._min = MIN;
Uint16Type.prototype._max = MAX;

Uint16Type.prototype._listUint = null;

Uint16Type.prototype.errorTextType = 'Uint16 number';

Uint16Type.prototype.encode = encode;
Uint16Type.prototype.decode = decode;
Uint16Type.prototype.bitsLength = bitsLength;

Uint16Type.prototype.setOpts = setOpts;
Uint16Type.prototype.setListOpts = setListOpts;
Uint16Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Uint16Type
}
