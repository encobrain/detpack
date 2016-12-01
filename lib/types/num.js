/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,
    Float16Type = require('./float16').Type,

    float16 = new Float16Type(),
    uint = new UintType(),

    MIN = NaN,
    MAX = NaN
    ;

var HALF = Math.pow(2,32),
    MAX_UINT64 = Math.pow(2,64),
    MIN_INT64 = -Math.pow(2,63),
    MAX_INT16 = Math.pow(2,15),
    MAX_UINT16 = Math.pow(2,16),
    MAX_INT8 = Math.pow(2,7),
    MAX_UINT8 = Math.pow(2,8)

function NumType () {
    BaseType.call(this, 'Num');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number < this._min || number > this._max)
        throw new Error(this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

    if (number != number) buffer._addIndex(0xE, 4);
    else if (number === Infinity) buffer._addIndex(0xC, 4);
    else if (number === -Infinity) buffer._addIndex(0xD, 4);
    else if (number % 1) {
        buffer._addIndex(0xA, 4);
        buffer._offset = buffer.writeDoubleLE(number, buffer._offset, true);
    } else if (number < 0) {
        if (number > -0x80)  {
            buffer._addIndex(0x4, 4);
            buffer[buffer._offset++] = number & 0xFF;
        } else if (number > -0x8000) {
            buffer._addIndex(0x5, 4);
            buffer[buffer._offset++] = number & 0xFF;
            buffer[buffer._offset++] = number >> 8 && 0xFF;
        } else if (number > -0x80000000) {
            buffer._addIndex(0x6, 4);
            buffer._offset = buffer.writeInt32LE(number, buffer._offset, true);
        } else if (number > MIN_INT64){
            buffer._addIndex(0x7, 4);
            buffer._offset = buffer.writeUInt32LE(number, buffer._offset, true);
            number /= HALF;
            if (number < 0 ) number = 0xFFFFFFFF + (number | 0);
            buffer._offset = buffer.writeUInt32LE(number, buffer._offset, true);
        } else throw new Error('Incorrect Num number');
    } else {
        if (number < 0x100) {
            buffer._addIndex(0,4);
            buffer[buffer._offset++] = number;
        } else if (number < 0x10000) {
            buffer._addIndex(1,4);
            buffer[buffer._offset++] = number & 0xFF;
            buffer[buffer._offset++] = number >> 8;
        } else if (number < 0x100000000) {
            buffer._addIndex(2,4);
            buffer._offset = buffer.writeUInt32LE(number, buffer._offset, false);
        } else if (number < MAX_UINT64){
            buffer._addIndex(3,4);
            buffer._offset = buffer.writeUInt32LE(number, buffer._offset, true);
            number /= HALF;
            buffer._offset = buffer.writeUInt32LE(number, buffer._offset, true);
        } else throw new Error('Incorrect Num number');
    }

    if (arguments.length === 1) buffer._fixIndex();

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0,
        length = numbers.length,
        number;

    this._listUint.encode(length, buffer);

    while (k < length) {
        number = +numbers[k++];

        if (number < this._min || number > this._max)
            throw new Error(this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

        if (number != number) buffer._addIndex(0xE, 4);
        else if (number === Infinity) buffer._addIndex(0xC, 4);
        else if (number === -Infinity) buffer._addIndex(0xD, 4);
        else if (number % 1) {
            buffer._addIndex(0xA, 4);
            buffer._offset = buffer.writeDoubleLE(number, buffer._offset, true);
        } else if (number < 0) {
            if (number > -0x80)  {  // int8
                buffer._addIndex(0x4, 4);
                buffer[buffer._offset++] = number & 0xFF;
            } else if (number > -0x8000) {  // int16
                buffer._addIndex(0x5, 4);
                buffer[buffer._offset++] = number & 0xFF;
                buffer[buffer._offset++] = number >> 8;
            } else if (number > -0x80000000) {  // int32
                buffer._addIndex(0x6, 4);
                buffer._offset = buffer.writeInt32LE(number, buffer._offset, true);
            } else if (number > MIN_INT64){   // int64
                buffer._addIndex(0x7, 4);
                buffer._offset = buffer.writeUInt32LE(number, buffer._offset, true);
                number /= HALF;
                if (number < 0 ) number = 0xFFFFFFFF + (number | 0);
                buffer._offset = buffer.writeUInt32LE(number, buffer._offset, true);
            } else throw new Error('Incorrect Num number');
        } else {
            if (number < 0x100) {  // uint8
                buffer._addIndex(0x0,4);
                buffer[buffer._offset++] = number;
            } else if (number < 0x10000) {  // uint16
                buffer._addIndex(0x1,4);
                buffer[buffer._offset++] = number & 0xFF;
                buffer[buffer._offset++] = number >> 8;
            } else if (number < 0x100000000) {  // uint32
                buffer._addIndex(0x2,4);
                buffer._offset = buffer.writeUInt32LE(number, buffer._offset, false);
            } else if (number < MAX_UINT64){  // uint64
                buffer._addIndex(0x3,4);
                buffer._offset = buffer.writeUInt32LE(number, buffer._offset, true);
                number /= HALF;
                buffer._offset = buffer.writeUInt32LE(number, buffer._offset, true);
            } else throw new Error('Incorrect Num number');
        }
    }

    if (arguments.length === 1) buffer._fixIndex();

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

    var type = buffer._getIndex(4), number;

    switch (type) {
        case 0x0:
            number = buffer[buffer._offset++];
            break;

        case 0x1:
            number = buffer[++buffer._offset] << 8;
            number += buffer[buffer._offset++ - 1];
            break;

        case 0x2:
            number = buffer.readUInt32LE(buffer._offset, true);
            buffer._offset += 4;
            break;

        case 0x3:
            number = buffer.readUInt32LE(buffer._offset + 4, true);
            number = number * HALF + buffer.readUInt32LE(buffer._offset, true);
            buffer._offset += 8;
            break;

        case 0x4:
            number = buffer[buffer._offset++];
            if (number > MAX_INT8) number-=MAX_UINT8;
            break;

        case 0x5:
            number = buffer[++buffer._offset] << 8;
            number += buffer[buffer._offset++ - 1];
            if (number > MAX_INT16) number-=MAX_UINT16;
            break;

        case 0x6:
            number = buffer.readInt32LE(buffer._offset, true);
            buffer._offset +=4;
            break;

        case 0x7:
            number =
                buffer.readInt32LE(buffer._offset + 4, true) * HALF +
                buffer.readUInt32LE(buffer._offset, true);
            buffer._offset += 8;
            break;

        case 0x8:
            number = float16.decode(buffer, 1);
            break;

        case 0x9:
            number = buffer.readFloatLE(buffer._offset, true);
            buffer._offset += 4;
            break;

        case 0xA:
            number = buffer.readDoubleLE(buffer._offset, true);
            buffer._offset += 8;
            break;

        case 0xC:
            number = Infinity;
            break;

        case 0xD:
            number = -Infinity;
            break;

        case 0xE:
            number = NaN;
            break;

        default:
            throw new Error('Unknown type of Num number: ' + type);
    }

    if (number < this._min || number > this._max)
        throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

    return number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0,
        numbers = new Array(length),
        type, number;

    while (k < length) {
        switch (type) {
            case 0x0:
                number = buffer[buffer._offset++];
                break;

            case 0x1:
                number = buffer[++buffer._offset] << 8;
                number += buffer[buffer._offset++ - 1];
                break;

            case 0x2:
                number = buffer.readUInt32LE(buffer._offset, true);
                buffer._offset += 4;
                break;

            case 0x3:
                number = buffer.readUInt32LE(buffer._offset + 4, true);
                number = number * HALF + buffer.readUInt32LE(buffer._offset, true);
                buffer._offset += 8;
                break;

            case 0x4:
                number = buffer[buffer._offset++];
                if (number > MAX_INT8) number-=MAX_UINT8;
                break;

            case 0x5:
                number = buffer[++buffer._offset] << 8;
                number += buffer[buffer._offset++ - 1];
                if (number > MAX_INT16) number-=MAX_UINT16;
                break;

            case 0x6:
                number = buffer.readInt32LE(buffer._offset, true);
                buffer._offset +=4;
                break;

            case 0x7:
                number =
                    buffer.readInt32LE(buffer._offset + 4, true) * HALF +
                    buffer.readUInt32LE(buffer._offset, true);
                buffer._offset += 8;
                break;

            case 0x8:
                number = float16.decode(buffer, 1);
                break;

            case 0x9:
                number = buffer.readFloatLE(buffer._offset, true);
                buffer._offset += 4;
                break;

            case 0xA:
                number = buffer.readDoubleLE(buffer._offset, true);
                buffer._offset += 8;
                break;

            case 0xC:
                number = Infinity;
                break;

            case 0xD:
                number = -Infinity;
                break;

            case 0xE:
                number = NaN;
                break;

            default:
                throw new Error('Unknown type of Num number: ' + type);
        }

        if (number < this._min || number > this._max)
            throw new Error('Decoded '+this.errorTextType+' out of bounds: '+number+'['+this._min+','+this._max+']');

        numbers[k++] = number;
    }

    return numbers;
}

function bitsLength (number) {
    number = +number;

    if (number != number || number === Infinity || number === -Infinity) return 4;
    else if (number % 1) return 68;
    else if (number < 0) return  (
        number > -0x80 ? 12 :
        number > -0x8000 ? 20 :
        number > -0x80000000 ? 36 : 68
    ); else return (
        number < 0x100 ? 12 :
        number < 0x10000 ? 20 :
        number < 0x100000000 ? 36 : 68
    );
}

function bitsLengthList (numbers) {
    var k = 0, length = numbers.length,
        len = uint.bitsLength(length),
        number;

    while (k < length) {
        number = +numbers[k++];

        if (number != number || number === Infinity || number === -Infinity) len += 4;
        else if (number % 1) len += 68;
        else if (number < 0) len += (
            number > -0x80 ? 12 :
            number > -0x8000 ? 20 :
            number > -0x80000000 ? 36 : 68
        ); else len += (
            number < 0x100 ? 12 :
            number < 0x10000 ? 20 :
            number < 0x100000000 ? 36 : 68
        );
    }

    return len;
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


NumType.prototype = new BaseType();
NumType.prototype.constructor = NumType;

NumType.prototype._min = MIN;
NumType.prototype._max = MAX;

NumType.prototype._listUint = null;

NumType.prototype.errorTextType = 'Num number';

NumType.prototype.encode = encode;
NumType.prototype.decode = decode;
NumType.prototype.bitsLength = bitsLength;

NumType.prototype.setOpts = setOpts;
NumType.prototype.setListOpts = setListOpts;
NumType.prototype.checkDefault = checkDefault;

module.exports = {
    Type: NumType
};
