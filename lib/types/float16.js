/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType(),

    MIN = NaN,
    MAX = NaN
    ;

function Float16Type () {
    BaseType.call(this, null, 'Float16');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number < this._min || number > this._max)
        throw new Error(this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

    if (number != number) {
        buffer[buffer._offset++] = 0xFF;
        buffer[buffer._offset++] = 0x7F;
    } else if (number > 65504) {
        buffer[buffer._offset++] = 0x00;
        buffer[buffer._offset++] = 0x7C;
    } else if (number < -65504) {
        buffer[buffer._offset++] = 0x00;
        buffer[buffer._offset++] = 0xFC
    } else {
        // THX!! @edvakf
        // http://javascript.g.hatena.ne.jp/edvakf/20101128/1291000731

        var sign = number < 0 ? 128 : 0,
            exp, frac;

        sign && (number = -number);

        exp  = ((Math.log(number) / Math.LN2) + 15) | 0;

        frac = Math.floor(number * Math.pow(2, 10 + 15 - exp));

        buffer[buffer._offset++] = frac & 0xFF;
        buffer[buffer._offset++] = sign + (exp << 2) + (frac >> 8 & 0x3);
    }

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0, length = numbers.length;

    this._listUint.encode(length, buffer);

    var i = buffer._offset, number;

    while (k < length) {
        number = +numbers[k++];

        if (number < this._min || number > this._max)
            throw new Error(this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

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

    buffer._offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {
    number = +number;

    if (number < this._min  || number > this._max)
        throw new Error('Default '+this.errorTextType+' out of bounds: '+number+' ['+this._min+','+this._max+'] in ' + propDesc);

}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length, number;

    this._listUint.checkDefault(length, propDesc);

    while (length--) {
        number = numbers[length];

        if (number < this._min  || number > this._max)
            throw new Error('Default '+this.errorTextType+' out of bounds: '+number+' ['+this._min+','+this._max+'] in ' + propDesc);
    }
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var low = buffer[buffer._offset++],
        high = buffer[buffer._offset++],
        exp = high >> 2 & 0x1F,
        frac = ((high & 0x3) << 8) + low,
        number = exp === 0x1F ?
            frac ? NaN : high >= 0x80 ? -Infinity : Infinity :
            (high >= 0x80 ? -1 : 1) * (1 + frac / 1024) * Math.pow(2, exp - 15);

    if (number < this._min || number > this._max)
        throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

    return number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = this._listUint.decode(buffer, 1),
        k = 0, numbers = new Array(length),
        i = buffer._offset;

    while (k< length) {
        var low = buffer[i++],
            high = buffer[i++],
            exp = high >> 2 & 0x1F,
            frac = ((high & 0x3) << 8) + low,
            number = exp === 0x1F ?
                frac ? NaN : high >= 0x80 ? -Infinity : Infinity :
                (high >= 0x80 ? -1 : 1) * (1 + frac / 1024) * Math.pow(2, exp - 15);

        if (number < this._min || number > this._max)
            throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

        numbers[k++] = number;
    }

    buffer._offset = i;

    return numbers;
}

function bitsLength (number) {
    return 16;
}

function bitsLengthList (numbers) {
    return this._listUint.bitsLength(numbers.length) + (numbers.length << 4);
}

function setOpts (opts, propDesc) {
    if (opts.length < 2) opts.unshift(null);

    var min = this._min = opts[0];

    if (min != null) {
        min = +min;

        if (min != min)
            throw new Error('Incorrect '+this.errorTextType+' 1st option in '+ propDesc);
    }

    this._min = min || MIN;

    var max = opts[1];

    if (max != null) {
        if (max != max || min != null && max < min)
            throw new Error('Incorrect '+this.errorTextType+' 2nd option in ' + propDesc);
    }

    this._max = max || MAX;
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


Float16Type.prototype = new BaseType();
Float16Type.prototype.constructor = Float16Type;

Float16Type.prototype._min = MIN;
Float16Type.prototype._max = MAX;

Float16Type.prototype._listUint = null;

Float16Type.prototype.errorTextType = 'Float16 number';

Float16Type.prototype.encode = encode;
Float16Type.prototype.decode = decode;
Float16Type.prototype.bitsLength = bitsLength;

Float16Type.prototype.setOpts = setOpts;
Float16Type.prototype.setListOpts = setListOpts;
Float16Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Float16Type
};
