/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

var MAX_VALUE = Math.pow(2,64),
    HALF = Math.pow(2,32)
    ;


function Uint64Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < 0  || number >= MAX_VALUE)
        throw new Error('Incorrect Uint64 number');

    buffer.offset = buffer.writeUInt32LE(number, buffer.offset, true);
    number /= HALF;
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

        if (number != number || number < 0  || number >= MAX_VALUE)
            throw new Error('Incorrect Uint64 number');

        i = buffer.writeUInt32LE(number, i, true);
        number /= HALF;
        i = buffer.writeUInt32LE(number, i, true);
    }

    buffer.offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number || number < 0  || number >= MAX_VALUE)
        throw new Error('Incorrect Uint64 default number in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Uint64 numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Uint64 numbers in ' + propDesc);

    while (length--) {
        number = +numbers[length];

        if (number != number || number < 0  || number >= MAX_VALUE)
            throw new Error('Incorrect Uint64 default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);

    var number = buffer.readUInt32LE(buffer.offset + 4, true);
    number = number * HALF + buffer.readUInt32LE(buffer.offset, true);
    buffer.offset += 8;

    return number;
}

function decodeList (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);

    var length = uint.decode(buffer),
        k = 0,
        numbers = new Array(length),
        i = buffer.offset,
        number;

    while (k < length) {
        numbers [k++] =
            buffer.readUInt32LE(i + 4, true) * HALF +
            buffer.readUInt32LE(i, true);
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

function setOpts () {
    throw new Error('Uint64 type cant have options');
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

Uint64Type.prototype = new BaseType();
Uint64Type.prototype.constructor = Uint64Type;

Uint64Type.prototype.encode = encode;
Uint64Type.prototype.decode = decode;
Uint64Type.prototype.encodedLength = encodedLength;

Uint64Type.prototype.setOpts = setOpts;
Uint64Type.prototype.setListOpts = setListOpts;
Uint64Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Uint64Type
}
