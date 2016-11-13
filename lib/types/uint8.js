/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;


function Uint8Type () {
    BaseType.call(this, 'Uint8');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < 0  || number >= 256)
        throw new Error('Incorrect Uint8 number');

    buffer[buffer._offset++] = number;

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

    var i = buffer._offset;

    while (k < length) {
        number = +numbers[k++];

        if (number != number || number < 0  || number >= 256)
            throw new Error('Incorrect Uint8 number');

        buffer[i++] = number;
    }

    buffer._offset = i;

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

    return buffer[buffer._offset++];
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0,
        numbers = new Array(length),
        i = buffer._offset;

    while (k < length) numbers[k++] = buffer[i++];

    buffer._offset = i;

    return numbers;
}

function bitsLength (number) {
    return 8;
}

function bitsLengthList (numbers) {
    return uint.bitsLength(numbers.length) + (numbers.length << 3);
}

function setOpts () {
    throw new Error('Uint type cant have options');
}

function setListOpts (opts, propDesc) {
    if (opts.length < 2) opts.unshift(0);

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

Uint8Type.prototype = new BaseType();
Uint8Type.prototype.constructor = Uint8Type;

Uint8Type.prototype.listMin = null;
Uint8Type.prototype.listMax = null;

Uint8Type.prototype.encode = encode;
Uint8Type.prototype.decode = decode;
Uint8Type.prototype.bitsLength = bitsLength;

Uint8Type.prototype.setOpts = setOpts;
Uint8Type.prototype.setListOpts = setListOpts;
Uint8Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Uint8Type
}
