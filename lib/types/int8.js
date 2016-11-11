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
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < MIN || number >= MAX)
        throw new Error('Incorrect Int8 number');

    buffer[buffer.offset++] = number & 0xFF;

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
            throw new Error('Incorrect Int8 number');

        buffer[i++] = number & 0xFF;
    }

    buffer.offset = i;

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

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Int8 numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Int8 numbers in ' + propDesc);

    while (length--) {
        number = +numbers[length];

        if (number != number || number < MIN  || number >= MAX)
            throw new Error('Incorrect Int8 default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);

    var number = buffer[buffer.offset++];
    return number > MAX ? number-UMAX : number;
}

function decodeList (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);

    var length = uint.decode(buffer),
        k = 0, numbers = new Array(length),
        i = buffer.offset, number;

    while (k < length) {
        number = buffer[i++];
        numbers[k++] = number > MAX ? number-UMAX : number;
    }

    buffer.offset = i;

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
    throw new Error('Int8 type cant have options');
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


Int8Type.prototype = new BaseType();
Int8Type.prototype.constructor = Int8Type;

Int8Type.prototype.listMin = null;
Int8Type.prototype.listMax = null;

Int8Type.prototype.encode = encode;
Int8Type.prototype.decode = decode;
Int8Type.prototype.encodedLength = encodedLength;

Int8Type.prototype.setOpts = setOpts;
Int8Type.prototype.setListOpts = setListOpts;
Int8Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Int8Type
};
