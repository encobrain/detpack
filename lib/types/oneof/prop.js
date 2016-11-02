/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../base'),

    CompilerOption = require('../../copiler/option').Option
    ;

function OneofProp () {
    base.Prop.call(this);
}

OneofProp.prototype = new base.Prop();
OneofProp.prototype.constructor = OneofProp;

function setCompilerOptions (options) {
    if (this.type !== 'STATIC') return;

    if (this.value instanceof CompilerOption) {
        this.value = options[this.name];

        if (this.value == null) throw new Error('Undefined "' + this.name + '" compiler option');
    }
}

OneofProp.prototype.index = null; // 0,1,...
OneofProp.prototype.type = null; // 'STATIC', 'TYPE'
OneofProp.prototype.name = null;  // for TYPE
OneofProp.prototype.value = null; // for STATIC

OneofProp.prototype.setCompilerOptions = setCompilerOptions;

module.exports = {
    Prop: OneofProp
}
