/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

var ONE = Math.pow(2,7),
    TWO = Math.pow(2,14),
    THREE = Math.pow(2,21),
    FOUR = Math.pow(2,28),
    FIVE = Math.pow(2,35),
    SIX = Math.pow(2,42),
    SEVEN = Math.pow(2,49),
    EIGHT = Math.pow(2,56),
    NINE = Math.pow(2,63),
    TEN = Math.pow(2,70)
    ;

function IntType () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number < 0) {
        buffer.addIndex(1,1);
        number = -number;
    } else buffer.addIndex(0,1);

    if (number != number || number >= TEN)
        throw new Error('Incorrect Int number');

    var i = buffer.offset;

    while (number >= ONE) {
        buffer[i++] = number & 0x7F;
        number /= 128;
    }

    buffer[i++] = number | 0x80;
    buffer.offset = i;

    if (arguments.length === 1) buffer.fixIndex();

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0, length = numbers.length, number;

    uint.encode(length, buffer);

    while (k < length) {
        number = +numbers[k++];

        if (number < 0) {
            buffer.addIndex(1,1);
            number = -number;
        } else buffer.addIndex(0,1);

        if (number != number || number >= TEN)
            throw new Error('Incorrect Int number');

        while (number >= ONE) {
            buffer[buffer.offset++] = number & 0x7F;
            number /= 128;
        }

        buffer[buffer.offset++] = number | 0x80;
    }

    if (arguments.length === 1) buffer.fixIndex();

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number || number <= -TEN  || number >= TEN)
        throw new Error('Incorrect Int default number in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Int numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Int numbers in ' + propDesc);

    while (length--) {
        number = +numbers[length];

        if (number != number || number <= -TEN  || number >= TEN)
            throw new Error('Incorrect Int default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var s = buffer.getIndex(1),
        si = buffer.offset,
        i = si
        ;

    while (buffer[i] < 128) i++;

    buffer.offset = i+1;

    var number = buffer[i--] & 0x7F;

    while (i >= si) number = number * 128 + buffer[i--];

    return s ? -number : number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var k=0, length = uint.decode(buffer),
        numbers = new Array(length),
        si, i, number, s;

    while (k < length) {

        s = buffer.getIndex(1);

        si = buffer.offset;
        i = si;

        while (buffer[i] < 128) i++;

        buffer.offset = i+1;

        number = buffer[i--] & 0x7F;

        while (i >= si) number = number * 128 + buffer[i--];

        numbers[k++] = s ? -number : number;
    }

    return numbers;
}

function encodedLength (number) {
    number = +number;
    if (number < 0) number = -number;

    return (
        number < ONE ?   9 :
        number < TWO ?   17 :
        number < THREE ? 25 :
        number < FOUR ?  33 :
        number < FIVE ?  41 :
        number < SIX ?   49 :
        number < SEVEN ? 57 :
        number < EIGHT ? 65 :
        number < NINE ?  73 : 81
    );
}

function encodedLengthList (numbers) {
    var k=0, length = numbers.length, number,
        len = uint.encodedLength(length);

    while (k<length) {
        number = +numbers[k++];
        if (number < 0) number = -number;
        len +=
            number < ONE ?   9 :
            number < TWO ?   17 :
            number < THREE ? 25 :
            number < FOUR ?  33 :
            number < FIVE ?  41 :
            number < SIX ?   49 :
            number < SEVEN ? 57 :
            number < EIGHT ? 65 :
            number < NINE ?  73 : 81
    }

    return len;
}

function setOpts (opts) {
    throw new Error('Int type cant have options');
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


IntType.prototype = new BaseType();
IntType.prototype.constructor = IntType;

IntType.prototype.listMin = null;
IntType.prototype.listMax = null;

IntType.prototype.encode = encode;
IntType.prototype.decode = decode;
IntType.prototype.encodedLength = encodedLength;

IntType.prototype.setOpts = setOpts;
IntType.prototype.setListOpts = setListOpts;
IntType.prototype.checkDefault = checkDefault;

module.exports = {
    Type: IntType
};
