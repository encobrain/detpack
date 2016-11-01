/**
 * Created by Encobrain on 31.10.16.
 */

var BaseType = require('./_base').Type;

function OneofProp () {}

OneofProp.prototype.index = null; // 0,1,...
OneofProp.prototype.type = null; // 'STATIC', 'TYPE'
OneofProp.prototype.name = null;  // for TYPE
OneofProp.prototype.value = null; // for STATIC

function OneofStruct () {
    Array.call(this);
}

OneofStruct.prototype = new Array();
OneofStruct.prototype.constructor = OneofStruct;

function OneofType () {
    BaseType.call(this);
}

OneofType.prototype = new BaseType();
OneofType.prototype.constructor = OneofType;

function isCorrectDefaultValue (value) {

}

function isCorrectOpts (opts) {

}

OneofType.prototype.isCorrectDefaultValue = isCorrectDefaultValue;
OneofType.prototype.isCorrectOpts = isCorrectOpts;

module.exports = {
    Property: OneofProp,
    Struct: OneofStruct,
    Type: OneofType
};