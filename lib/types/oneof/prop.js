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
        var value = options[this.value.name];

        if (value == null) throw new Error('Undefined "' + this.value.name + '" compiler option in "'+this.structName+'" struct');
    }
}

OneofProp.prototype.index = null; // 0,1,...
OneofProp.prototype.type = null; // 'STATIC', 'STRUCT'
OneofProp.prototype.name = null;  // for STRUCT
OneofProp.prototype.value = null; // for STATIC

OneofProp.prototype.setCompilerOptions = setCompilerOptions;

module.exports = {
    Prop: OneofProp
}
