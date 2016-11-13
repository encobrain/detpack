/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,
    Float16Type = require('./float16').Type,

    float16 = new Float16Type(),
    uint = new UintType()
    ;

var HALF = Math.pow(2,32),
    MAX_UINT64 = Math.pow(2,64),
    MIN_INT64 = -Math.pow(2,63),
    MAX_INT16 = Math.pow(2,15),
    MAX_UINT16 = Math.pow(2,16),
    MAX_INT8 = Math.pow(2,7),
    MAX_UINT8 = Math.pow(2,8)

function NumType () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

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

    if (length < this.listMin)
        throw new Error('Required minimum ' + this.listMin + ' Num numbers');

    if (length > this.listMax)
        throw new Error('Allow maximum ' + this.listMax + ' Num numbers');

    uint.encode(length, buffer);

    while (k < length) {
        number = +numbers[k++];

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

}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Num numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Num numbers in ' + propDesc);
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number, low;

    switch (buffer._getIndex(4)) {
        case 0x0:
            return buffer[buffer._offset++];
        case 0x1:
            number = buffer[++buffer._offset] << 8;

            return number + buffer[buffer._offset++ - 1];
        case 0x2:
            number = buffer.readUInt32LE(buffer._offset, true);
            buffer._offset += 4;

            return number;
        case 0x3:
            number = buffer.readUInt32LE(buffer._offset + 4, true);
            number = number * HALF + buffer.readUInt32LE(buffer._offset, true);
            buffer._offset += 8;
            return number;
        case 0x4:
            number = buffer[buffer._offset++];
            return number > MAX_INT8 ? number-MAX_UINT8 : number;
        case 0x5:
            number = buffer[++buffer._offset] << 8;
            number = number + buffer[buffer._offset++ - 1];

            return number > MAX_INT16 ? number-MAX_UINT16 : number;
        case 0x6:
            number = buffer.readInt32LE(buffer._offset, true);
            buffer._offset +=4;
            return number;
        case 0x7:
            number = buffer.readUInt32LE(buffer._offset + 4, true);
            low = buffer.readUInt32LE(buffer._offset, true);

            number = number > 0x7FFFFFFF ?
                (number-0xFFFFFFFF) * HALF + (low && (low - HALF)) :
                number * HALF + low;

            buffer._offset += 8;

            return number;
        case 0x8: return float16.decode(buffer, 1);
        case 0x9:
            number = buffer.readFloatLE(buffer._offset, true);
            buffer._offset += 4;
            return number;
        case 0xA:
            number = buffer.readDoubleLE(buffer._offset, true);
            buffer._offset += 8;
            return number;
        case 0xC: return Infinity;
        case 0xD: return -Infinity;
        case 0xE: return NaN;
        default: throw new Error('Unknown type of Num number');
    }
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0,
        numbers = new Array(length),
        number, low;

    while (k < length) {
        switch (buffer._getIndex(4)) {
            case 0x0:  // uint8
                numbers[k] = buffer[buffer._offset++];
                break;
            case 0x1:  // uint16
                number = buffer[++buffer._offset] << 8;

                numbers[k] = number + buffer[buffer._offset++ - 1];
                break;
            case 0x2:  // uint32
                numbers[k] = buffer.readUInt32LE(buffer._offset, true);
                buffer._offset += 4;
                break;
            case 0x3:  // uint64
                number = buffer.readUInt32LE(buffer._offset + 4, true);
                numbers[k] = number * HALF + buffer.readUInt32LE(buffer._offset, true);
                buffer._offset += 8;
                break
            case 0x4:  // int8
                number = buffer[buffer._offset++];
                numbers[k] = number > MAX_INT8 ? number-MAX_UINT8 : number;
                break;
            case 0x5:  // int16
                number = buffer[++buffer._offset] << 8;
                number = number + buffer[buffer._offset++ - 1];

                numbers[k] = number > MAX_INT16 ? number-MAX_UINT16 : number;
                break;
            case 0x6:   // int32
                numbers[k] = buffer.readInt32LE(buffer._offset, true);
                buffer._offset +=4;
                break
            case 0x7:   // int64
                number = buffer.readUInt32LE(buffer._offset + 4, true);
                low = buffer.readUInt32LE(buffer._offset, true);

                numbers[k] = number > 0x7FFFFFFF ?
                    (number-0xFFFFFFFF) * HALF + (low && (low - HALF)) :
                    number * HALF + low;

                buffer._offset += 8;

                break;
            case 0x8: numbers[k] = float16.decode(buffer, 1); break;
            case 0x9:
                numbers[k] = buffer.readFloatLE(buffer._offset, true);
                buffer._offset += 4;
                break;
            case 0xA:
                numbers[k] = buffer.readDoubleLE(buffer._offset, true);
                buffer._offset += 8;
                break;
            case 0xC: numbers[k] = Infinity; break;
            case 0xD: numbers[k] = -Infinity; break;
            case 0xE: numbers[k] = NaN; break;
            default: throw new Error('Unknown type of Num number');
        }

        k++;
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

function setOpts (opts) {
    throw new Error('Num type cant have options');
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
    this.bitsLength = bitsLengthList;
    this.checkDefault = checkDefaultList;
}


NumType.prototype = new BaseType();
NumType.prototype.constructor = NumType;

NumType.prototype.listMin = null;
NumType.prototype.listMax = null;

NumType.prototype.encode = encode;
NumType.prototype.decode = decode;
NumType.prototype.bitsLength = bitsLength;

NumType.prototype.setOpts = setOpts;
NumType.prototype.setListOpts = setListOpts;
NumType.prototype.checkDefault = checkDefault;

module.exports = {
    Type: NumType
};
