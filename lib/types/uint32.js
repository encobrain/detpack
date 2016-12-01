/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType(),

    MIN = 0,
    MAX = Math.pow(2,32);


function Uint32Type () {
    BaseType.call(this, 'Uint32');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number)
        throw new Error('Incorrect '+this.errorTextType+': '+number);

    if (number < this._min  || number > this._max)
        throw new Error(this.errorTextType+' out of bounds: ' + number + '['+this._min+','+this._max+')');

    buffer._offset = buffer.writeUInt32LE(number, buffer._offset, true);

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
            throw new Error(this.errorTextType+' out of bounds: ' + number + '['+this._min+','+this._max+')');

        i = buffer.writeUInt32LE(number, i, true);
    }

    buffer._offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number)
        throw new Error('Incorrect default '+this.errorTextType+': '+number+' in ' + propDesc);

    if (number < this._min  || number > this._max)
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

        if (number < this._min  || number > this._max)
            throw new Error('Default '+this.errorTextType+' out of bounds: '+number+' ['+this._min+','+this._max+') in ' + propDesc);
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number = buffer.readUInt32LE(buffer._offset, true);

    if (number < this._min || number > this._max)
        throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+')');

    buffer._offset += 4;

    return number;
}

function decodeList (buf, inited) {
    if (!inited) this.initBuffer(buf);

    var length = this._listUint.decode(buf, 1),
        k = 0,
        numbers = new Array(length),
        i = buf._offset,
        number
        ;

    while (k < length) {
        number = buf.readUInt32LE(i, true);

        if (number < this._min || number > this._max)
            throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+')');

        numbers[k++] = number;

        i += 4;
    }

    buf._offset = i;

    return numbers;
}

function bitsLength (number) {
    return 32;
}

function bitsLengthList (numbers) {
    return this._listUint.bitsLength(numbers.length) + (numbers.length << 5);
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

Uint32Type.prototype = new BaseType();
Uint32Type.prototype.constructor = Uint32Type;

Uint32Type.prototype._min = MIN;
Uint32Type.prototype._max = MAX;

Uint32Type.prototype._listUint = null;

Uint32Type.prototype.errorTextType = 'Uint32 number';

Uint32Type.prototype.encode = encode;
Uint32Type.prototype.decode = decode;
Uint32Type.prototype.bitsLength = bitsLength;

Uint32Type.prototype.setOpts = setOpts;
Uint32Type.prototype.setListOpts = setListOpts;
Uint32Type.prototype.checkDefault = checkDefault

module.exports = {
    Type: Uint32Type
}
