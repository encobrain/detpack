/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;


function Uint16Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < 0  || number >= 65536)
        throw new Error('Incorrect Uint16 number');

    buffer[buffer.offset++] = number & 0xFF;
    buffer[buffer.offset++] = number >> 8;

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0, length = numbers.length, number;

    if (length < this.listMin)
        throw new Error('Required minimum ' + this.listMin + ' Uint16 numbers');

    if (length > this.listMax)
        throw new Error('Allow maximum ' + this.listMax + ' Uint16 numbers');

    uint.encode(length, buffer);

    var i = buffer.offset;

    while (k < length) {
        number = +numbers[k++];

        if (number != number || number < 0  || number >= 65536)
            throw new Error('Incorrect Uint16 number');

        buffer[i++] = number & 0xFF;
        buffer[i++] = number >> 8;
    }

    buffer.offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number || number < 0  || number >= 65536)
        throw new Error('Incorrect Uint16 default number in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Uint16 numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Uint16 numbers in ' + propDesc);

    while (length--) {
        number = +numbers[length];

        if (number != number || number < 0  || number >= 65536)
            throw new Error('Incorrect Uint16 default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number = buffer[++buffer.offset] * 256;

    return number + buffer[buffer.offset++ - 1];
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0,
        numbers = new Array(length),
        i = buffer.offset,
        number
        ;

    while (k < length) {
        number = buffer[++i] * 256;
        numbers[k++] = number + buffer[i++ - 1]; // need sep count
    }

    buffer.offset = i;

    return numbers;
}

function encodedLength (number) {
    return 16;
}

function encodedLengthList (numbers) {
    return uint.encodedLength(numbers.length) + (numbers.length << 4);
}

function setOpts () {
    throw new Error('Uint16 type cant have options');
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

Uint16Type.prototype = new BaseType();
Uint16Type.prototype.constructor = Uint16Type;

Uint8Type.prototype.listMin = null;
Uint8Type.prototype.listMax = null;

Uint16Type.prototype.encode = encode;
Uint16Type.prototype.decode = decode;
Uint16Type.prototype.encodedLength = encodedLength;

Uint16Type.prototype.setOpts = setOpts;
Uint16Type.prototype.setListOpts = setListOpts;
Uint16Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Uint16Type
}
