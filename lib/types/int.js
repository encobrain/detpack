/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

var ONE = Math.pow(2,6),    MONE = -ONE,
    TWO = Math.pow(2,13),   MTWO = -TWO,
    THREE = Math.pow(2,20), MTHREE = -THREE,
    FOUR = Math.pow(2,27),  MFOUR = -FOUR,
    FIVE = Math.pow(2,34),  MFIVE = -FIVE,
    SIX = Math.pow(2,41),   MSIX = -SIX,
    SEVEN = Math.pow(2,48), MSEVEN = -SEVEN,
    EIGHT = Math.pow(2,55), MEIGHT = -EIGHT,
    NINE = Math.pow(2,62),  MNINE = -NINE,
    TEN = Math.pow(2,69),   MTEN = -TEN
    ;

var M_FIX = [ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,TEN];

function IntType () {
    BaseType.call(this, 'Int');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < MTEN || number >= TEN)
        throw new Error('Incorrect Int number');

    if (number < 0) {
        number +=
            number >= MONE ? ONE :
            number >= MTWO ? TWO :
            number >= MTHREE ? THREE :
            number >= MFOUR ? FOUR :
            number >= MFIVE ? FIVE :
            number >= MSIX ? SIX :
            number >= MSEVEN ? SEVEN :
            number >= MEIGHT ? EIGHT :
            number >= MNINE ? NINE : TEN;
    }

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

    var k = 0, length = numbers.length, number;

    if (length < this.listMin)
        throw new Error('Required minimum ' + this.listMin + ' Int numbers');

    if (length > this.listMax)
        throw new Error('Allow maximum ' + this.listMax + ' Int numbers');

    uint.encode(length, buffer);

    while (k < length) {
        number = +numbers[k++];

        if (number < 0) {
            buffer._addIndex(1,1);
            number = -number;
        } else buffer._addIndex(0,1);

        if (number != number || number >= TEN)
            throw new Error('Incorrect Int number');

        while (number >= ONE) {
            buffer[buffer._offset++] = number & 0x7F;
            number /= 128;
        }

        buffer[buffer._offset++] = number | 0x80;
    }

    if (arguments.length === 1) buffer._fixIndex();

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

    var si = buffer._offset,
        i = si,
        s = buffer[i] & ONE
        ;

    while (buffer[i] < 128) i++;

    if (s) s = M_FIX[i-si];

    buffer._offset = i+1;

    var number = buffer[i--] & 0x7F;

    while (i >= si) number = number * 128 + buffer[i--];

    return s ? s-number : number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var k=0, length = uint.decode(buffer, 1),
        numbers = new Array(length),
        si, i, number, s;

    while (k < length) {

        si = buffer._offset;
        i = si;
        s = buffer[i] & ONE;

        while (buffer[i] < 128) i++;

        if (s) s = M_FIX[i-si];

        buffer._offset = i+1;

        number = buffer[i--] & 0x7F;

        while (i >= si) number = number * 128 + buffer[i--];

        numbers[k++] = s ? s-number : number;
    }

    return numbers;
}

function bitsLength (number) {
    number = +number;
    return number < 0 ? (
        number >= MONE ?   8 :
        number >= MTWO ?   16 :
        number >= MTHREE ? 24 :
        number >= MFOUR ?  32 :
        number >= MFIVE ?  40 :
        number >= MSIX ?   48 :
        number >= MSEVEN ? 56 :
        number >= MEIGHT ? 64 :
        number >= MNINE ?  72 : 80
    ) : (
        number < ONE ?   8 :
        number < TWO ?   16 :
        number < THREE ? 24 :
        number < FOUR ?  32 :
        number < FIVE ?  40 :
        number < SIX ?   48 :
        number < SEVEN ? 56 :
        number < EIGHT ? 64 :
        number < NINE ?  72 : 80
    );
}

function bitsLengthList (numbers) {
    var k=0, length = numbers.length, number,
        len = uint.bitsLength(length);

    while (k<length) {
        number = +numbers[k++];
        len +=
            number < 0 ? (
                number >= MONE ?   8 :
                number >= MTWO ?   16 :
                number >= MTHREE ? 24 :
                number >= MFOUR ?  32 :
                number >= MFIVE ?  40 :
                number >= MSIX ?   48 :
                number >= MSEVEN ? 56 :
                number >= MEIGHT ? 64 :
                number >= MNINE ?  72 : 80
            ) : (
                number < ONE ?   8 :
                number < TWO ?   16 :
                number < THREE ? 24 :
                number < FOUR ?  32 :
                number < FIVE ?  40 :
                number < SIX ?   48 :
                number < SEVEN ? 56 :
                number < EIGHT ? 64 :
                number < NINE ?  72 : 80
            )
    }

    return len;
}

function setOpts (opts) {
    throw new Error('Int type cant have options');
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


IntType.prototype = new BaseType();
IntType.prototype.constructor = IntType;

IntType.prototype.listMin = null;
IntType.prototype.listMax = null;

IntType.prototype.encode = encode;
IntType.prototype.decode = decode;
IntType.prototype.bitsLength = bitsLength;

IntType.prototype.setOpts = setOpts;
IntType.prototype.setListOpts = setListOpts;
IntType.prototype.checkDefault = checkDefault;

module.exports = {
    Type: IntType
};
