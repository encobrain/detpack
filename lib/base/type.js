/**
 * Created by Encobrain on 01.11.16.
 */

function BaseType () {
    this.requiredKeys = [];
}



function setOpts (opts) {
    throw new Error('.setOpts() is not defined');
}

function setListOpts (opts) {
    throw new Error('.setListOpts() is not defined');
}

function checkDefault (value) {
    throw new Error('.checkDefault() is not defined');
}

function encode (value, buffer) {
    throw new Error('.encode() is not defined');
}

function decode (buffer) {
    throw new Error('.decode() is not defined');
}

function encodedLength (value) {
    throw new Error('.encodedLength() is not defined');
}

function addIndex (index, bitsPerIndex) {
    this.indexBits += bitsPerIndex;

    if (this.indexBits > 7) {
        this.indexBits &= 7;

        if (this.indexOffset != null) {
            this[this.indexOffset] = (this.indexByte << this.indexBits) | (index >> (bitsPerIndex - this.indexBits));
        }

        this.indexOffset = this.offset++;
        this.indexByte = index;
    } else this.indexByte = (this.indexByte << bitsPerIndex) | index;
}

function fixIndex () {
    if (this.indexOffset != null) {
        this[this.indexOffset] = this.indexByte << (8 - this.indexBits);
    }
}

function getBuffer (value) {
    var buffer = new Buffer(Math.ceil(this.encodedLength(value) / 8));

    buffer.offset = 0;
    buffer.indexOffset = null;
    buffer.indexBits = null;
    buffer.indexByte = null;
    buffer.addIndex = addIndex;
    buffer.fixIndex = fixIndex;

    return buffer;
}

function getIndex (bitsPerIndex) {

}

function initBuffer (value, buffer) {

    buffer.inited = true;
    buffer.offset = 0;
    buffer.indexOffset = 0;
    buffer.indexBit = 8;
    buffer.indexByte = 0;
    buffer.getIndex = getIndex;

    return buffer;
}

BaseType.prototype.requiredKeys = null;

BaseType.prototype.setOpts = setOpts;
BaseType.prototype.setListOpts = setListOpts;
BaseType.prototype.checkDefault = checkDefault;

BaseType.prototype.encode = encode;
BaseType.prototype.decode = decode;

BaseType.prototype.encodedLength = encodedLength;
BaseType.prototype.getBuffer = getBuffer;
BaseType.prototype.initBuffer = initBuffer;

module.exports = {
    Type: BaseType
};
