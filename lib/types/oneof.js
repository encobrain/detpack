/**
 * Created by Encobrain on 31.10.16.
 */

var BaseType = require('./_base').Type;

function OneofType () {
    BaseType.call(this);
}

OneofType.prototype = new BaseType();

function OneofParseDefaultValue (text, i, newError) {

}

function isCorrectOpts (opts) {

}

OneofType.prototype.parseDefaultValue = OneofParseDefaultValue;
OneofType.prototype.isCorrectOpts = isCorrectOpts;

function OneofProperty () {}

OneofProperty.prototype.index = null; // 0,1,...
OneofProperty.prototype.type = null; // 'STATIC', 'TYPE'
OneofProperty.prototype.name = null;  // for TYPE
OneofProperty.prototype.value = null; // for STATIC

module.exports = {
    Type: OneofType,
    Property: OneofProperty
};