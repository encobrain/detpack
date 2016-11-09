/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../base');

function OneofType (indexFn, values) {
    base.Type.call(this);
}

OneofType.prototype = new base.Type();
OneofType.prototype.constructor = OneofType;

function setOpts (opts) {
    throw new Error ('Oneof type cant have options');
}

function setListOpts (opts) {

}

function encode (value, buffer) {

}

function decode (buffer) {

}

function encodedLength (value) {

}

OneofType.prototype.setOpts = setOpts;
OneofType.prototype.setListOpts = setListOpts;
OneofType.prototype.encode = encode;
OneofType.prototype.decode = decode;
OneofType.prototype.encodedLength = encodedLength;

module.exports = {
    Type: OneofType
};
