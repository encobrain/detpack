/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type;


function Uint16Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < 0  || number >= 65536)
        throw new Error('Incorrect Uint16 number');

    buffer[buffer.offset++] = number & 0xFF;
    buffer[buffer.offset++] = number >> 8;

    return buffer;
}

function decode (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);

    var number = buffer[++buffer.offset] * 256;

    return number + buffer[buffer.offset++ - 1];
}

function encodedLength (number) {
    return 16;
}

function setOpts () {
    throw new Error('Uint16 type cant have options');
}

function setListOpts (opts) {

}

Uint16Type.prototype = new BaseType();
Uint16Type.prototype.constructor = Uint16Type;

Uint16Type.prototype.encode = encode;
Uint16Type.prototype.decode = decode;
Uint16Type.prototype.encodedLength = encodedLength;

Uint16Type.prototype.setOpts = setOpts;
Uint16Type.prototype.setListOpts = setListOpts;

module.exports = {
    Type: Uint16Type
}
