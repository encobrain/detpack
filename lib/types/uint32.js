/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type;

var MAX_VALUE = Math.pow(2,32);


function Uint32Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < 0  || number >= MAX_VALUE)
        throw new Error('Incorrect Uint32 number');

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
            throw new Error('Incorrect Uint32 number');

        i = buffer.writeUInt32LE(number, i, true);
    }

    buffer.offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number || number < 0  || number >= MAX_VALUE)
        throw new Error('Incorrect Uint32 default number in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Uint32 numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Uint32 numbers in ' + propDesc);

    while (length--) {
        number = +numbers[length];

        if (number != number || number < 0  || number >= MAX_VALUE)
            throw new Error('Incorrect Uint32 default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number = buffer.readUInt32LE(buffer.offset, true);
    buffer.offset += 4;

    return number;
}

function decodeList (buf, inited) {
    if (!inited) this.initBuffer(buf);

    var length = uint.decode(buf, 1),
        k = 0,
        numbers = new Array(length),
        i = buf.offset,
        number
        ;

    while (k < length) {
        numbers[k++] = buf.readUInt32LE(i, true);
        i += 4;
    }

    buf.offset = i;

    return numbers;
}

function bitsLength (number) {
    return 32;
}

function bitsLengthList (numbers) {
    return uint.bitsLength(numbers.length) + (numbers.length << 5);
}

function setOpts () {
    throw new Error('Uint32 type cant have options');
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

Uint32Type.prototype = new BaseType();
Uint32Type.prototype.constructor = Uint32Type;

Uint32Type.prototype.encode = encode;
Uint32Type.prototype.decode = decode;
Uint32Type.prototype.bitsLength = bitsLength;

Uint32Type.prototype.setOpts = setOpts;
Uint32Type.prototype.setListOpts = setListOpts;
Uint32Type.prototype.checkDefault = checkDefault

module.exports = {
    Type: Uint32Type
}
