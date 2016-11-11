/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

var MIN = -Math.pow(2,63),
    MAX = Math.pow(2,63),
    HALF = Math.pow(2,32),
    UMAX = Math.pow(2,64)
    ;

function Int64Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < MIN  || number >= MAX)
        throw new Error('Incorrect Int64 number');

    buffer.offset = buffer.writeUInt32LE(number, buffer.offset, true);
    number /= HALF;

    if (number < 0) number = 0xFFFFFFFF + (number | 0);

    buffer.offset = buffer.writeUInt32LE(number, buffer.offset, true);

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0, length = numbers.length, number;

    uint.encode(length, buffer);

    var i = buffer.offset;

    while (k < length) {
        number = +numbers[k++];

        if (number != number || number < MIN  || number >= MAX)
            throw new Error('Incorrect Int64 number');

        i = buffer.writeUInt32LE(number, i, true);
        number /= HALF;
        if (number < 0) number = 0xFFFFFFFF + (number | 0);
        i = buffer.writeUInt32LE(number, i, true);
    }

    buffer.offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number || number < MIN  || number >= MAX)
        throw new Error('Incorrect Int64 default number in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Int64 numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Int64 numbers in ' + propDesc);

    while (length--) {
        number = +numbers[length];

        if (number != number || number < MIN  || number >= MAX)
            throw new Error('Incorrect Int64 default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number = buffer.readUInt32LE(buffer.offset + 4, true),
        low = buffer.readUInt32LE(buffer.offset, true);

    number = number > 0x7FFFFFFF ?
        (number-0xFFFFFFFF) * HALF + (low && (low - HALF)) :
        number * HALF + low;

    buffer.offset += 8;

    return number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0,
        numbers = new Array(length),
        i = buffer.offset,
        number, low;

    while (k < length) {
        number = buffer.readUInt32LE(i + 4, true);
        low = buffer.readUInt32LE(i, true);

        numbers[k++] = number > 0x7FFFFFFF ?
            (number-0xFFFFFFFF) * HALF + (low && (low - HALF)) :
            number * HALF + low;

        i += 8;
    }

    buffer.offset = i;

    return numbers;
}

function encodedLength (number) {
    return 64;
}

function encodedLengthList (numbers) {
    return uint.encodedLength(numbers.length) + (numbers.length << 6);
}

function setOpts (opts) {
    throw new Error('Int64 type cant have options');
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
    this.encodedLength = encodedLengthList;
    this.checkDefault = checkDefaultList;
}


Int64Type.prototype = new BaseType();
Int64Type.prototype.constructor = Int64Type;

Int64Type.prototype.listMin = null;
Int64Type.prototype.listMax = null;

Int64Type.prototype.encode = encode;
Int64Type.prototype.decode = decode;
Int64Type.prototype.encodedLength = encodedLength;

Int64Type.prototype.setOpts = setOpts;
Int64Type.prototype.setListOpts = setListOpts;
Int64Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Int64Type
};
