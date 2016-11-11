/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;


function Uint8Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < 0  || number >= 256)
        throw new Error('Incorrect Uint8 number');

    buffer[buffer.offset++] = number;

    return buffer
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0,
        length = numbers.length,
        number
        ;

    if (length < this.listMin)
        throw new Error('Required minimum ' + this.listMin + ' Uint8 numbers');

    if (length > this.listMax)
        throw new Error('Allow maximum ' + this.listMax + ' Uint8 numbers');

    uint.encode(length, buffer);

    var i = buffer.offset;

    while (k < length) {
        number = +numbers[k++];

        if (number != number || number < 0  || number >= 256)
            throw new Error('Incorrect Uint8 number');

        buffer[i++] = number;
    }

    buffer.offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number || number < 0  || number >= 256)
        throw new Error('Incorrect Uint8 default number in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Uint8 numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Uint8 numbers in ' + propDesc);

    while (length--) {
        number = +numbers[length];

        if (number != number || number < 0  || number >= 256)
            throw new Error('Incorrect Uint8 default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    return buffer[buffer.offset++];
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer),
        k = 0,
        numbers = new Array(length),
        i = buffer.ofset;

    while (k < length) numbers[k++] = buffer[i++];

    buffer.offset = i;

    return numbers;
}

function encodedLength (number) {
    return 8;
}

function encodedLengthList (numbers) {
    return uint.encodedLength(numbers.length) + (numbers.length << 3);
}

function setOpts () {
    throw new Error('Uint type cant have options');
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

Uint8Type.prototype = new BaseType();
Uint8Type.prototype.constructor = Uint8Type;

Uint8Type.prototype.listMin = null;
Uint8Type.prototype.listMax = null;

Uint8Type.prototype.encode = encode;
Uint8Type.prototype.decode = decode;
Uint8Type.prototype.encodedLength = encodedLength;

Uint8Type.prototype.setOpts = setOpts;
Uint8Type.prototype.setListOpts = setListOpts;
Uint8Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Uint8Type
}
