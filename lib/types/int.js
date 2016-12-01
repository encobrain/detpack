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
    TEN = Math.pow(2,69),   MTEN = -TEN,     UTEN = TEN*2,

    MIN = MTEN, MAX = TEN
    ;

var M_FIX = [UONE,UTWO,UTHREE,UFOUR,UFIVE,USIX,USEVEN,UEIGHT,UNINE,UTEN];

function IntType () {
    BaseType.call(this, 'Int');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number)
        throw new Error('Incorrect '+this.errorTextType+': '+number);

    if (number < this._min  || number > this._max)
        throw new Error(this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+')');

    var i = buffer._offset;

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
    else if (number >= 64 && number < 128) {
        buffer[i++] = number;
        number = 0;
    }

    while (number >= 128) {
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

    this._listUint.encode(length, buffer);

    i = buffer._offset;

    while (k < length) {
        number = +numbers[k++];

        if (number != number)
            throw new Error('Incorrect '+this.errorTextType+': '+number);

        if (number < this._min  || number > this._max)
            throw new Error(this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+')');

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
        else if (number >= 64 && number < 128) {
            buffer[i++] = number;
            number = 0;
        }

        while (number > 128) {
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

    if (number != number)
        throw new Error('Incorrect default '+this.errorTextType+': '+number+' in ' + propDesc);

    if (number < this._min  || number > this._max)
        throw new Error('Default '+this.errorTextType+' out of bounds: '+number+' ['+this._min+','+this._max+') in ' + propDesc);
}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length,
        number;

    this._listUint.checkDefault(length);

    while (length--) {
        number = +numbers[length];

        if (number != number)
            throw new Error('Incorrect default '+this.errorTextType+': '+number+' in ' + propDesc);

        if (number < this._min  || number > this._max)
            throw new Error('Default '+this.errorTextType+' out of bounds: '+number+' ['+this._min+','+this._max+') in ' + propDesc);
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var si = buffer._offset,
        i = si,
        max = si+this._decodeMaxBytes;

    while (i < max && buffer[i] < 0x80) i++;

    if (i === max) throw new Error('Decode '+this.errorTextType+' bytes error');

    var s = (buffer[i] & ONE) && M_FIX[i-si];

    buffer._offset = i+1;

    var number = buffer[i--] & 0x7F;

    while (i >= si) number = number * 128 + buffer[i--];

    if (s) number-=s;

    if (number < this._min || number > this._max)
        throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+')');

    return number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var k=0, length = this._listUint.decode(buffer, 1),
        numbers = new Array(length),
        maxBytes = this._decodeMaxBytes,
        si, i, number, max, s;

    while (k < length) {

        si = buffer._offset;
        i = si;
        max = si+maxBytes;

        while (i<max && buffer[i] < 0x80) i++;

        if (i === max) throw new Error('Decode '+this.errorTextType+' bytes error');

        s = (buffer[i] & ONE) && M_FIX[i-si];

        buffer._offset = i+1;

        number = buffer[i--] & 0x7F;

        while (i >= si) number = number * 128 + buffer[i--];

        if (s) number-=s;

        if (number < this._min || number > this._max)
            throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+')');

        numbers[k++] = number;
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
        len = this._listUint.bitsLength(length);

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

function setOpts (opts, propDesc) {
    if (opts.length < 2) opts.unshift(0);

    var min = this._min = +opts[0];

    if (min != min || min < MIN)
        throw new Error('Incorrect '+this.errorTextType+' 1st option in '+ propDesc);

    var max = opts[1];

    if (max != null) {
        if (max != max || max < min || max > MAX)
            throw new Error('Incorrect '+this.errorTextType+' 2nd option in ' + propDesc);
    }

    this._max = max = max || MAX;

    min = bitsLength(min) / 8;
    max = bitsLength(max) / 8;

    this._decodeMaxBytes = max > min ? max : min;
}

function setListOpts (opts, propDesc) {
    this._listUint = new UintType();
    this._listUint.errorTextType = 'List count';
    this._listUint.setOpts(opts, propDesc);

    this.encode = encodeList;
    this.decode = decodeList;
    this.bitsLength = bitsLengthList;
    this.checkDefault = checkDefaultList;
}


IntType.prototype = new BaseType();
IntType.prototype.constructor = IntType;

IntType.prototype._min = MIN;
IntType.prototype._max = MAX;

IntType.prototype._decodeMaxBytes = 10;

IntType.prototype._listUint = null;

IntType.prototype.errorTextType = 'Int number';

IntType.prototype.encode = encode;
IntType.prototype.decode = decode;
IntType.prototype.bitsLength = bitsLength;

IntType.prototype.setOpts = setOpts;
IntType.prototype.setListOpts = setListOpts;
IntType.prototype.checkDefault = checkDefault;

module.exports = {
    Type: IntType
};
