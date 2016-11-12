/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

var MIN = -Math.pow(2,31),
    MAX = Math.pow(2,31)
    ;

function Int32Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < MIN  || number >= MAX)
        throw new Error('Incorrect Int32 number');

    buffer.offset = buffer.writeInt32LE(number, buffer.offset, true);

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
            throw new Error('Incorrect Int32 number');

        i = buffer.writeInt32LE(number, i, true);
    }

    buffer.offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number || number < MIN  || number >= MAX)
        throw new Error('Incorrect Int32 default number in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Int32 numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Int32 numbers in ' + propDesc);

    while (length--) {
        number = +numbers[length];

        if (number != number || number < MIN  || number >= MAX)
            throw new Error('Incorrect Int32 default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number = buffer.readInt32LE(buffer.offset, true);
    buffer.offset += 4;

    return number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0,
        numbers = new Array(length),
        i = buffer.offset
        ;

    while (k < length) {
        numbers[k++] = buffer.readInt32LE(i, true);
        i += 4;
    }

    buffer.offset = i;

    return numbers;
}

function bitsLength (number) {
    return 32;
}

function bitsLengthList (numbers) {
    return uint.bitsLength(numbers.length) + (numbers.length << 5);
}

function setOpts (opts) {
    throw new Error('Int32 type cant have options');
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
    this.bitsLength = bitsLengthList;
    this.checkDefault = checkDefaultList;
}


Int32Type.prototype = new BaseType();
Int32Type.prototype.constructor = Int32Type;

Int32Type.prototype.listMin = null;
Int32Type.prototype.listMax = null;

Int32Type.prototype.encode = encode;
Int32Type.prototype.decode = decode;
Int32Type.prototype.bitsLength = bitsLength;

Int32Type.prototype.setOpts = setOpts;
Int32Type.prototype.setListOpts = setListOpts;
Int32Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Int32Type
};
