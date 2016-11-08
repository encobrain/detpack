/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type;

var MAX_VALUE = Math.pow(2,64),
    HALF = Math.pow(2,32)
    ;


function Uint64Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < 0  || number >= MAX_VALUE)
        throw new Error('Incorrect Uint64 number');

    buffer.offset = buffer.writeUInt32LE(number, buffer.offset, true);
    number /= HALF;
    buffer.offset = buffer.writeUInt32LE(number, buffer.offset, true);
}

function decode (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);

    var number = buffer.readUInt32LE(buffer.offset + 4, true);
    number = number * HALF + buffer.readUInt32LE(buffer.offset, true);
    buffer.offset += 8;

    return number;
}

function encodedLength (number) {
    return 32;
}

function setOpts () {
    throw new Error('Uint64 type cant have options');
}

function setListOpts (opts) {

}

Uint64Type.prototype = new BaseType();
Uint64Type.prototype.constructor = Uint64Type;

Uint64Type.prototype.encode = encode;
Uint64Type.prototype.decode = decode;
Uint64Type.prototype.encodedLength = encodedLength;

Uint64Type.prototype.setOpts = setOpts;
Uint64Type.prototype.setListOpts = setListOpts;

module.exports = {
    Type: Uint64Type
}
