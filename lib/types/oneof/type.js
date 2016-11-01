/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../base');

function OneofType () {
    base.Type.call(this);
}

OneofType.prototype = new base.Type();
OneofType.prototype.constructor = OneofType;

function isCorrectDefaultValue (value) {

}

function isCorrectOpts (opts) {

}

OneofType.prototype.isCorrectDefaultValue = isCorrectDefaultValue;
OneofType.prototype.isCorrectOpts = isCorrectOpts;

module.exports = {
    Type: OneofType
};
