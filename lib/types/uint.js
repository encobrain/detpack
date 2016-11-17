/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type;

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

function UintType () {
    BaseType.call(this, 'Uint');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < 0  || number >= TEN)
        throw new Error('Incorrect Uint number');

    var i = buffer._offset;

    while (number >= ONE) {
        buffer[i++] = number & 0x7F;
        number /= 128;
    }

    buffer[i++] = number | 0x80;
    buffer._offset = i;

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0, length = numbers.length;

    if (length < this.listMin)
        throw new Error('Required minimum ' + this.listMin + ' Uint numbers');

    if (length > this.listMax)
        throw new Error('Allow maximum ' + this.listMax + ' Uint numbers');

    encode(length, buffer);

    var i = buffer._offset, number;

    while (k < length) {
        number = +numbers[k++];

        if (number != number || number < 0  || number >= TEN)
            throw new Error('Incorrect Uint number');

        while (number >= ONE) {
            buffer[i++] = number & 0x7F;
            number /= 128;
        }

        buffer[i++] = number | 0x80;
    }

    buffer._offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number != number || number < 0  || number >= TEN)
        throw new Error('Incorrect Uint default number in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Uint numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Uint numbers in ' + propDesc);

    while (length--) {
        number = +numbers[length];

        if (number != number || number < 0  || number >= TEN)
            throw new Error('Incorrect Uint default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var si = buffer._offset,
        i = si, max = si+10
        ;

    while (buffer[i] < 128 && i < max) i++;

    if (i === max) throw new Error('Uint bytes error');

    buffer._offset = i+1;

    var number = buffer[i--] & 0x7F;

    while (i >= si) number = number * 128 + buffer[i--];

    return number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var k=0, length = decode(buffer, 1),
        numbers = new Array(length),
        si = buffer._offset, bi = si,
        i, number,max;

    while (k < length) {
        i = bi;
        si = bi;
        max = si+10

        while (buffer[i] < 128 && i < max) i++;

        if (i === max) throw new Error('Uint bytes error');

        bi = i+1;

        number = buffer[i--] & 0x7F;

        while (i >= si) number = number * 128 + buffer[i--];

        numbers[k++] = number;
    }

    buffer._offset = bi;

    return numbers;
}

function bitsLength (number) {
    number = +number;
    return (
        number < ONE ? 8 :
        number < TWO ? 16 :
        number < THREE ? 24 :
        number < FOUR ? 32 :
        number < FIVE ? 40 :
        number < SIX ? 48 :
        number < SEVEN ? 56 :
        number < EIGHT ? 64 :
        number < NINE ? 72 : 80
    );
}

function bitsLengthList (numbers) {
    var k=0, length = numbers.length, number,
        len = bitsLength(length);

    while (k<length) {
        number = +numbers[k++];
        len +=
            number < ONE ? 8 :
            number < TWO ? 16 :
            number < THREE ? 24 :
            number < FOUR ? 32 :
            number < FIVE ? 40 :
            number < SIX ? 48 :
            number < SEVEN ? 56 :
            number < EIGHT ? 64 :
            number < NINE ? 72 : 80;
    }

    return len;
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

UintType.prototype = new BaseType();
UintType.prototype.constructor = UintType;

UintType.prototype.listMin = null;
UintType.prototype.listMax = null;

UintType.prototype.encode = encode;
UintType.prototype.decode = decode;
UintType.prototype.bitsLength = bitsLength;

UintType.prototype.setOpts = setOpts;
UintType.prototype.setListOpts = setListOpts;
UintType.prototype.checkDefault = checkDefault;

module.exports = {
    Type: UintType
}
