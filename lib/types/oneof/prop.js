/**
 * Created by Encobrain on 01.11.16.
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

module.exports = {
    Prop: OneofProp
}
