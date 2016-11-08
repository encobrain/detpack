/**
 * Created by encobrain on 08.11.16.
 */

var BaseType = require('../base').Type;

var ONE = Math.pow(2,7),
    TWO = Math.pow(2,14),
    THREE = Math.pow(2,21),
    FOUR = Math.pow(2,28),
    FIVE = Math.pow(2,35),
    SIX = Math.pow(2,42),
    SEVEN = Math.pow(2,49),
    EIGHT = Math.pow(2,56),
    NINE = Math.pow(2,63),
    TEN = Math.pow(2,70)
    ;

function UintType () {
    BaseType.call(this);
}

function encode (number, buffer) {
    if (!buffer) buffer = this.getBuffer(number);

    number = +number;

    if (number != number || number < 0  || number >= TEN)
        throw new Error('Incorrect Uint number');

    var i = buffer.offset;

    while (number >= ONE) {
        buffer[i++] = number & 0x7F;
        number /= 128;
    }

    buffer[i++] = number | 0x80;
    buffer.offset = i;

    return buffer;
}

function decode (buffer) {
    if (!buffer.inited) this.initBuffer(buffer);

    var si = buffer.offset,
        i = si
        ;

    while (buffer[i] < 128) i++;

    buffer.offset = i+1;

    var number = buffer[i--] & 0x7F;

    while (i >= si) number = number * 128 + buffer[i--];

    return number;
}

function encodedLength (number) {
    number = +number;
    return (
        number < ONE ? 8 :
        number < TWO ? 16 :
        number < THREE ? 24 :
        number < FOUR ? 32 :
        number < FIVE ? 40 :
        number < SIX ? 48 :
        number < SEVEN ? 56 :
        number < EIGHT ? 64 :
        number < NINE ? 72 : 80
    );
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
