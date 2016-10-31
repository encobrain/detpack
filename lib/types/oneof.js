/**
 * Created by Encobrain on 31.10.16.
 */

var BaseType = require('./_base').Type;

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

function OneofProp () {}

OneofProp.prototype.index = null; // 0,1,...
OneofProp.prototype.type = null; // 'STATIC', 'TYPE'
OneofProp.prototype.name = null;  // for TYPE
OneofProp.prototype.value = null; // for STATIC

module.exports = {
    Type: OneofType,
    Property: OneofProp
};