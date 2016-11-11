/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

function Float16Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number) {
        buffer[buffer.offset++] = 0xFF;
        buffer[buffer.offset++] = 0x7F;
    } else if (number > 65504) {
        buffer[buffer.offset++] = 0x00;
        buffer[buffer.offset++] = 0x7C;
    } else if (number < -65504) {
        buffer[buffer.offset++] = 0x00;
        buffer[buffer.offset++] = 0xFC
    } else {
        // THX!! @edvakf
        // http://javascript.g.hatena.ne.jp/edvakf/20101128/1291000731

        var sign = number < 0 ? 128 : 0,
            exp, frac;

        sign && (number = -number);

        exp  = ((Math.log(number) / Math.LN2) + 15) | 0;

        frac = Math.floor(number * Math.pow(2, 10 + 15 - exp));

        buffer[buffer.offset++] = frac & 0xFF;
        buffer[buffer.offset++] = sign + (exp << 2) + (frac >> 8 & 0x3);
    }

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0, length = numbers.length;

    uint.encode(length, buffer);

    var i = buffer.offset, number;

    while (k < length) {
        number = +numbers[k++];

        if (number != number) {
            buffer[i++] = 0xFF;
            buffer[i++] = 0x7F;
        } else if (number > 65504) {
            buffer[i++] = 0x00;
            buffer[i++] = 0x7C;
        } else if (number < -65504) {
            buffer[i++] = 0x00;
            buffer[i++] = 0xFC
        } else {
            var sign = number < 0 ? 128 : 0,
                exp, frac;

            sign && (number = -number);

            exp  = ((Math.log(number) / Math.LN2) + 15) | 0;

            frac = Math.floor(number * Math.pow(2, 10 + 15 - exp));

            buffer[i++] = frac & 0xFF;
            buffer[i++] = sign + (exp << 2) + (frac >> 8 & 0x3);
        }
    }

    buffer.offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {

}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Float16 numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Float16 numbers in ' + propDesc);
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var low = buffer[buffer.offset++],
        high = buffer[buffer.offset++],
        exp = high >> 2 & 0x1F,
        frac = ((high & 0x3) << 8) + low;

    if (exp === 0x1F) return frac ? NaN : high >= 0x80 ? -Infinity : Infinity;

    return (high >= 0x80 ? -1 : 1) * (1 + frac / 1024) * Math.pow(2, exp - 15);
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0, numbers = new Array(length),
        i = buffer.index;

    while (k< length) {
        var low = buffer[i++],
            high = buffer[i++],
            exp = high >> 2 & 0x1F,
            frac = ((high & 0x3) << 8) + low;

        if (exp === 0x1F) numbers[k++] = frac ? NaN : high >= 0x80 ? -Infinity : Infinity;
        else numbers[k++] = (high >= 0x80 ? -1 : 1) * (1 + frac / 1024) * Math.pow(2, exp - 15);
    }

    buffer.offset = i;

    return numbers;
}

function encodedLength (number) {
    return 16;
}

function encodedLengthList (numbers) {
    return uint.encodedLength(numbers.length) + (umbers.length << 4);
}

function setOpts (opts) {
    throw new Error('Float16 type cant have options');
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


Float16Type.prototype = new BaseType();
Float16Type.prototype.constructor = Float16Type;

Float16Type.prototype.listMin = null;
Float16Type.prototype.listMax = null;

Float16Type.prototype.encode = encode;
Float16Type.prototype.decode = decode;
Float16Type.prototype.encodedLength = encodedLength;

Float16Type.prototype.setOpts = setOpts;
Float16Type.prototype.setListOpts = setListOpts;
Float16Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Float16Type
};
