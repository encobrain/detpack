/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

var MIN = -Math.pow(2,7),
    MAX = Math.pow(2,7),
    UMAX = Math.pow(2,8)
    ;

function Int8Type () {
    BaseType.call(this, 'Int8');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < MIN || number >= MAX)
        throw new Error('Incorrect Int8 number');

    buffer[buffer._offset++] = number & 0xFF;

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0, length = numbers.length, number;

    if (length < this._listMin)
        throw new Error('Required minimum ' + this._listMin + ' Int8 numbers');

    if (length > this._listMax)
        throw new Error('Allow maximum ' + this._listMax + ' Int8 numbers');

    uint.encode(length, buffer);

    var i = buffer._offset;

    while (k < length) {
        number = +numbers[k++];

        if (number != number || number < MIN  || number >= MAX)
            throw new Error('Incorrect Int8 number');

        buffer[i++] = number & 0xFF;
    }

    buffer._offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number || number < MIN  || number >= MAX)
        throw new Error('Incorrect Int8 default number in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    if (length < this._listMin)
        throw new Error('Incorrect default. Required minimum ' + this._listMin + ' Int8 numbers in ' + propDesc);

    if (length > this._listMax)
        throw new Error('Incorrect default. Allow maximum ' + this._listMax + ' Int8 numbers in ' + propDesc);

    while (length--) {
        number = +numbers[length];

        if (number != number || number < MIN  || number >= MAX)
            throw new Error('Incorrect Int8 default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number = buffer[buffer._offset++];
    return number >= MAX ? number-UMAX : number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0, numbers = new Array(length),
        i = buffer._offset, number;

    while (k < length) {
        number = buffer[i++];
        numbers[k++] = number >= MAX ? number-UMAX : number;
    }

    buffer._offset = i;

    return numbers;
}

function bitsLength (number) {
    return 8;
}

function bitsLengthList (numbers) {
    return uint.bitsLength(numbers.length) + (numbers.length << 3);
}

function setOpts (opts) {
    throw new Error('Int8 type cant have options');
}

function setListOpts (opts, propDesc) {
    if (opts.length < 2) opts.unshift(0);

    var min = this._listMin = +opts[0];

    if (min != min || min < 0)
        throw new Error('Incorrect 1st list option in ' + propDesc);

    var max = opts[1];

    if (max != null) {
        if (max != max || max < min)
            throw new Error('Incorrect 2nd list option in ' + propDesc);
    }

    this._listMax = max || Number.MAX_VALUE;

    this.encode = encodeList;
    this.decode = decodeList;
    this.bitsLength = bitsLengthList;
    this.checkDefault = checkDefaultList;
}


Int8Type.prototype = new BaseType();
Int8Type.prototype.constructor = Int8Type;

Int8Type.prototype._listMin = null;
Int8Type.prototype._listMax = null;

Int8Type.prototype.encode = encode;
Int8Type.prototype.decode = decode;
Int8Type.prototype.bitsLength = bitsLength;

Int8Type.prototype.setOpts = setOpts;
Int8Type.prototype.setListOpts = setListOpts;
Int8Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Int8Type
};
