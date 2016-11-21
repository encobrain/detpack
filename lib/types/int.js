/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

var ONE = Math.pow(2,6),    MONE = -ONE,     UONE = ONE*2,
    TWO = Math.pow(2,13),   MTWO = -TWO,     UTWO = TWO*2,
    THREE = Math.pow(2,20), MTHREE = -THREE, UTHREE = THREE*2,
    FOUR = Math.pow(2,27),  MFOUR = -FOUR,   UFOUR = FOUR*2,
    FIVE = Math.pow(2,34),  MFIVE = -FIVE,   UFIVE = FIVE*2,
    SIX = Math.pow(2,41),   MSIX = -SIX,     USIX = SIX*2,
    SEVEN = Math.pow(2,48), MSEVEN = -SEVEN, USEVEN = SEVEN*2,
    EIGHT = Math.pow(2,55), MEIGHT = -EIGHT, UEIGHT = EIGHT*2,
    NINE = Math.pow(2,62),  MNINE = -NINE,   UNINE = NINE*2,
    TEN = Math.pow(2,69),   MTEN = -TEN,     UTEN = TEN*2
    ;

var M_FIX = [UONE,UTWO,UTHREE,UFOUR,UFIVE,USIX,USEVEN,UEIGHT,UNINE,UTEN];

function IntType () {
    BaseType.call(this, 'Int');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < MTEN || number >= TEN)
        throw new Error('Incorrect Int number');

    if (number < 0)
        number +=
            number >= MONE ? UONE :
            number >= MTWO ? UTWO :
            number >= MTHREE ? UTHREE :
            number >= MFOUR ? UFOUR :
            number >= MFIVE ? UFIVE :
            number >= MSIX ? USIX :
            number >= MSEVEN ? USEVEN :
            number >= MEIGHT ? UEIGHT :
            number >= MNINE ? UNINE : UTEN;

    var i = buffer._offset;

    while (number >= UONE) {
        buffer[i++] = number & 0x7F;
        number /= 128;
    }

    buffer[i++] = number | 0x80;
    buffer._offset = i;

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0,
        length = numbers.length,
        number, i;

    if (length < this.listMin)
        throw new Error('Required minimum ' + this.listMin + ' Int numbers');

    if (length > this.listMax)
        throw new Error('Allow maximum ' + this.listMax + ' Int numbers');

    uint.encode(length, buffer);

    i = buffer._offset;

    while (k < length) {
        number = +numbers[k++];

        if (number != number || number < MTEN || number >= TEN)
            throw new Error('Incorrect Int number');

        if (number < 0)
            number +=
                number >= MONE ? UONE :
                number >= MTWO ? UTWO :
                number >= MTHREE ? UTHREE :
                number >= MFOUR ? UFOUR :
                number >= MFIVE ? UFIVE :
                number >= MSIX ? USIX :
                number >= MSEVEN ? USEVEN :
                number >= MEIGHT ? UEIGHT :
                number >= MNINE ? UNINE : UTEN;

        while (number > UONE) {
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

    if (number != number || number < MTEN  || number >= TEN)
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

        if (number != number || number < MTEN  || number >= TEN)
            throw new Error('Incorrect Int default number in ' + propDesc + '['+length+']');
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var si = buffer._offset,
        i = si,
        s = buffer[i] & ONE
        ;

    while (buffer[i] < 0x80) i++;

    if (s) s = M_FIX[i-si];

    buffer._offset = i+1;

    var number = buffer[i--] & 0x7F;

    while (i >= si) number = number * 128 + buffer[i--];

    return s ? number-s : number;
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

        while (buffer[i] < 0x80) i++;

        if (s) s = M_FIX[i-si];

        buffer._offset = i+1;

        number = buffer[i--] & 0x7F;

        while (i >= si) number = number * 128 + buffer[i--];

        numbers[k++] = s ? number-s : number;
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
