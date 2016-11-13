/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

function Float64Type () {
    BaseType.call(this, 'Float64');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    buffer._offset = buffer.writeDoubleLE(+number, buffer._offset, true);

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0, length = numbers.length;

    if (length < this.listMin)
        throw new Error('Required minimum ' + this.listMin + ' Float64 numbers');

    if (length > this.listMax)
        throw new Error('Allow maximum ' + this.listMax + ' Float64 numbers');

    uint.encode(length, buffer);

    var i = buffer._offset;

    while (k < length) i = buffer.writeDoubleLE(+numbers[k++], i, true);

    buffer._offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {

}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length;

    if (length < this.listMin)
        throw new Error('Incorrect default. Required minimum ' + this.listMin + ' Float64 numbers in ' + propDesc);

    if (length > this.listMax)
        throw new Error('Incorrect default. Allow maximum ' + this.listMax + ' Float64 numbers in ' + propDesc);
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number = buffer.readDoubleLE(buffer._offset, true);
    buffer._offset += 8;

    return number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0, numbers = new Array(length),
        i = buffer._offset;

    while (k < length) {
        numbers[k++] = buffer.readDoubleLE(i, true);
        i += 8;
    }

    buffer._offset = i;

    return numbers;
}

function bitsLength (number) {
    return 64;
}

function bitsLengthList (numbers) {
    return uint.bitsLength(numbers.length) + (numbers.length << 6);
}

function setOpts (opts) {
    throw new Error('Float64 type cant have options');
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


Float64Type.prototype = new BaseType();
Float64Type.prototype.constructor = Float64Type;

Float64Type.prototype.listMin = null;
Float64Type.prototype.listMax = null;

Float64Type.prototype.encode = encode;
Float64Type.prototype.decode = decode;
Float64Type.prototype.bitsLength = bitsLength;

Float64Type.prototype.setOpts = setOpts;
Float64Type.prototype.setListOpts = setListOpts;
Float64Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Float64Type
};
