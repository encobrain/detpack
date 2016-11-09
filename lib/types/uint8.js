/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type;


function Uint8Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < 0  || number >= 256)
        throw new Error('Incorrect Uint8 number');

    buffer[buffer.offset++] = number;

    return buffer
}

function decode (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);

    return buffer[buffer.offset++];
}

function encodedLength (number) {
    return 8;
}

function setOpts () {
    throw new Error('Uint type cant have options');
}

function setListOpts (opts) {

}

Uint8Type.prototype = new BaseType();
Uint8Type.prototype.constructor = Uint8Type;

Uint8Type.prototype.encode = encode;
Uint8Type.prototype.decode = decode;
Uint8Type.prototype.encodedLength = encodedLength;

Uint8Type.prototype.setOpts = setOpts;
Uint8Type.prototype.setListOpts = setListOpts;

module.exports = {
    Type: Uint8Type
}
