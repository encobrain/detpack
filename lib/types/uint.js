/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type;

function UintType () {
    BaseType.call(this);
}

function encode (value, buffer) {
    if (!buffer) buffer = this.getBuffer(value);



    if (arguments.length == 1) buffer.fixIndex();

    return buffer;
}

function decode (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);


}

function encodedLength (value) {

}

function setOpts () {
    throw new Error('Uint type cant have options');
}

function setListOpts (opts) {

}

UintType.prototype = new BaseType();
UintType.prototype.constructor = UintType;

UintType.prototype.encode = encode;
UintType.prototype.decode = decode;
UintType.prototype.encodedLength = encodedLength;

UintType.prototype.setOpts = setOpts;
UintType.prototype.setListOpts = setListOpts;

module.exports = {
    Type: UintType
}
