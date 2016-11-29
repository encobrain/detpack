/**
 * Created by encobrain on 11.11.16.
 */

var BaseType = require('../base').Type,
    UintType = require('./uint').Type,

    uint = new UintType()
    ;

function Float32Type () {
    BaseType.call(this, 'Float32');
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    buffer._offset = buffer.writeFloatLE(+number, buffer._offset, true);

    return buffer;
}

function encodeList (numbers, buffer) {
    if (!buffer) buffer = this.getBuffer(numbers);

    var k = 0, length = numbers.length;

    if (length < this._listMin)
        throw new Error('Required minimum ' + this._listMin + ' Float32 numbers');

    if (length > this._listMax)
        throw new Error('Allow maximum ' + this._listMax + ' Float32 numbers');

    uint.encode(length, buffer);

    var i = buffer._offset;

    while (k < length) i = buffer.writeFloatLE(+numbers[k++], i, true);

    buffer._offset = i;

    return buffer;
}

function checkDefault (number, propDesc) {

}

function checkDefaultList (numbers, propDesc) {
    var length = numbers.length;

    if (length < this._listMin)
        throw new Error('Incorrect default. Required minimum ' + this._listMin + ' Float32 numbers in ' + propDesc);

    if (length > this._listMax)
        throw new Error('Incorrect default. Allow maximum ' + this._listMax + ' Float32 numbers in ' + propDesc);
}

function decode (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var number = buffer.readFloatLE(buffer._offset, true);
    buffer._offset += 4;

    return number;
}

function decodeList (buffer, inited) {
    if (!inited) this.initBuffer(buffer);

    var length = uint.decode(buffer, 1),
        k = 0, numbers = new Array(length),
        i = buffer.index;

    while (k < length) {
        numbers[k++] = buffer.readFloatLE(i, true);
        i += 4;
    }

    buffer._offset = i;

    return numbers;
}

function bitsLength (number) {
    return 32;
}

function bitsLengthList (numbers) {
    return uint.bitsLength(numbers.length) + (numbers.length << 5);
}

function setOpts (opts) {
    throw new Error('Float32 type cant have options');
}

function setListOpts (opts, propDesc) {
    if (opts.length < 2) opts.unshift(0);

    var min = this._listMin = +opts[0];

    if (min != min || min < 0)
        throw new Error('Incorrect 1st list option in ' + propDesc);

    var max = opts[1];

    if (max != null) {
        if (max != max || max < min)
            throw new Error('Incorrect 2nd list option in ' + propDesc);
    }

    this._listMax = max || Number.MAX_VALUE;

    this.encode = encodeList;
    this.decode = decodeList;
    this.bitsLength = bitsLengthList;
    this.checkDefault = checkDefaultList;
}


Float32Type.prototype = new BaseType();
Float32Type.prototype.constructor = Float32Type;

Float32Type.prototype._listMin = null;
Float32Type.prototype._listMax = null;

Float32Type.prototype.encode = encode;
Float32Type.prototype.decode = decode;
Float32Type.prototype.bitsLength = bitsLength;

Float32Type.prototype.setOpts = setOpts;
Float32Type.prototype.setListOpts = setListOpts;
Float32Type.prototype.checkDefault = checkDefault;

module.exports = {
    Type: Float32Type
};
