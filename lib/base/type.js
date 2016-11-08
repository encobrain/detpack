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

BaseType.prototype.requiredKeys = null;

BaseType.prototype.setOpts = setOpts;
BaseType.prototype.setListOpts = setListOpts;
BaseType.prototype.checkDefault = checkDefault;

BaseType.prototype.encode = encode;
BaseType.prototype.decode = decode;

BaseType.prototype.encodedLength = encodedLength;

module.exports = {
    Type: BaseType
};
