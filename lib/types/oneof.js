/**
 * Created by Encobrain on 31.10.16.
 */

var base = require('../base');

function OneofProp () {
    base.Prop.call(this);
}

OneofProp.prototype = new base.Prop();
OneofProp.prototype.constructor = OneofProp;

OneofProp.prototype.index = null; // 0,1,...
OneofProp.prototype.type = null; // 'STATIC', 'TYPE'
OneofProp.prototype.name = null;  // for TYPE
OneofProp.prototype.value = null; // for STATIC



function OneofStruct () {
    base.Struct.call(this);
}

OneofStruct.prototype = new base.Struct();
OneofStruct.prototype.constructor = OneofStruct;




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
    Property: OneofProp,
    Struct: OneofStruct,
    Type: OneofType
};