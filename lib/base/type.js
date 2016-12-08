/**
 * Created by Encobrain on 01.11.16.
 */

function BaseType (name) {
    this.name = name;
}

function setOpts (opts, propDescription) {
    throw new Error('.setOpts() is not defined');
}

function setListOpts (opts, propDescription) {
    throw new Error('.setListOpts() is not defined');
}

function checkDefault (value, propDescription) {
    throw new Error('.checkDefault() is not defined');
}

function encode (value, buffer) {
    throw new Error('.encode() is not defined');
}

function decode (buffer, bufferInited) {
    throw new Error('.decode() is not defined');
}

function bitsLength (value) {
    throw new Error('.bitsLength() is not defined');
}

function addIndex (index, bitsPerIndex) {
    this._indexBits += bitsPerIndex;

    if (this._indexBits > 8) {
        this._indexBits &= 7;

        if (this._indexOffset != null) {
            this[this._indexOffset] = (this._indexByte << (bitsPerIndex - this._indexBits)) | (index >> this._indexBits);
        }

        this._indexOffset = this._offset++;
        this._indexByte = index;
    } else this._indexByte = (this._indexByte << bitsPerIndex) | index;
}

function fixIndex () {
    if (this._indexOffset != null) {
        this[this._indexOffset] = this._indexByte << (8 - this._indexBits);
    }
}

function getBuffer (value) {
    var buffer = new Buffer(Math.ceil(this.bitsLength(value) / 8) + 1);
    buffer[0] = this.id;

    buffer._offset = 1;
    buffer._indexOffset = null;
    buffer._indexBits = 8;
    buffer._indexByte = null;
    buffer._addIndex = addIndex;
    buffer._fixIndex = fixIndex;

    return buffer;
}

var bitsToMask = [0x00, 0x01, 0x03, 0x07, 0x0F, 0x1F, 0x3F, 0x7F,0xFF]

function getIndex (bitsPerIndex) {

    this._indexShift -= bitsPerIndex;

    if (this._indexShift < 0) {
        this._indexShift += 8;

        if (this._indexByte != null) {
            var high = this._indexByte << (8 - this._indexShift);
            this._indexByte = this[this._offset++];

            return (high | (this._indexByte >> this._indexShift)) & bitsToMask[bitsPerIndex];
        }

        this._indexByte = this[this._offset++];
    }

    return (this._indexByte >> this._indexShift) & bitsToMask[bitsPerIndex];
}

function initBuffer (buffer) {

    buffer._offset = 0;
    buffer._indexShift = 0;
    buffer._indexByte = null;
    buffer._getIndex = getIndex;

    return buffer;
}

BaseType.prototype.id = null;
BaseType.prototype.name = null;

BaseType.prototype.setOpts = setOpts;
BaseType.prototype.setListOpts = setListOpts;
BaseType.prototype.checkDefault = checkDefault;

BaseType.prototype.encode = encode;
BaseType.prototype.decode = decode;

BaseType.prototype.bitsLength = bitsLength;
BaseType.prototype.getBuffer = getBuffer;
BaseType.prototype.initBuffer = initBuffer;

module.exports = {
    Type: BaseType
};
