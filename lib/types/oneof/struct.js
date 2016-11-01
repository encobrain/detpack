/**
 * Created by Encobrain on 01.11.16.
 */


var base = require('../base');

function OneofStruct () {
    base.Struct.call(this);
}

OneofStruct.prototype = new base.Struct();
OneofStruct.prototype.constructor = OneofStruct;

function compileStruct (types, options) {

}

OneofStruct.prototype.compile = compileStruct;

module.exports = {
    Struct: OneofStruct
}