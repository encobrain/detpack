/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type;

var MAX_VALUE = Math.pow(2,32);


function Uint32Type () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < 0  || number >= MAX_VALUE)
        throw new Error('Incorrect Uint32 number');

    buffer.offset = buffer.writeUInt32LE(number, buffer.offset, true);

    return buffer;
}

function decode (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);

    var number = buffer.readUInt32LE(buffer.offset, true);
    buffer.offset += 4;

    return number;
}

function encodedLength (number) {
    return 32;
}

function setOpts () {
    throw new Error('Uint32 type cant have options');
}

function setListOpts (opts) {

}

Uint32Type.prototype = new BaseType();
Uint32Type.prototype.constructor = Uint32Type;

Uint32Type.prototype.encode = encode;
Uint32Type.prototype.decode = decode;
Uint32Type.prototype.encodedLength = encodedLength;

Uint32Type.prototype.setOpts = setOpts;
Uint32Type.prototype.setListOpts = setListOpts;

module.exports = {
    Type: Uint32Type
}
