/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

var MIN = -Math.pow(2,15),
    MAX = Math.pow(2,15),
    UMAX = Math.pow(2,16)
    ;

function Int16Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < MIN  || number >= MAX)
        throw new Error('Incorrect Int16 number');

    buffer[buffer.offset++] = number & 0xFF;
    buffer[buffer.offset++] = number >> 8;

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
            throw new Error('Incorrect Int16 number');

        buffer[i++] = number & 0xFF;
        buffer[i++] = number >> 8;
    }

    buffer.offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number || number < MIN  || number >= MAX)
        throw new Error('Incorrect Int16 default number in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Int16 numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Int16 numbers in ' + propDesc);

    while (length--) {
        number = +numbers[length];

        if (number != number || number < MIN  || number >= MAX)
            throw new Error('Incorrect Int16 default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);

    var number = buffer[++buffer.offset] * 256;
    number += buffer[buffer.offset++ - 1];   // need sep count

    return number > MAX ? number-UMAX : number;
}

function decodeList (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);

    var length = uint.decode(buffer),
        k = 0,
        numbers = new Array(length),
        i = buffer.offset,
        number;

    while (k < length) {
        number = buffer[++i] * 256;
        number += buffer[i++ - 1];   // need sep count

        numbers[k++] = number > MAX ? number-UMAX : number;
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

function setOpts (opts) {
    throw new Error('Int16 type cant have options');
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


Int16Type.prototype = new BaseType();
Int16Type.prototype.constructor = Int16Type;

Int16Type.prototype.listMin = null;
Int16Type.prototype.listMax = null;

Int16Type.prototype.encode = encode;
Int16Type.prototype.decode = decode;
Int16Type.prototype.encodedLength = encodedLength;

Int16Type.prototype.setOpts = setOpts;
Int16Type.prototype.setListOpts = setListOpts;
Int16Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Int16Type
};
