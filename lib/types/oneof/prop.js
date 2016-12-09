/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../../base'),

    CompilerOption = require('../../compiler/option').Option
    ;

function OneofProp (structName) {
    base.Prop.call(this, structName);
}

OneofProp.prototype = new base.Prop();
OneofProp.prototype.constructor = OneofProp;

function setCompilerOptions (options) {
    if (this.type !== 'STATIC') return;

    if (this.value instanceof CompilerOption) {
        if (this.value.name === 'null') return this.value=null;
        if (this.value.name === 'true') return this.value=true;
        if (this.value.name === 'false') return this.value=false;

        var value = options[this.value.name];

        if (value == null) throw new Error('Undefined "' + this.value.name + '" compiler option in "'+this.structName+'" struct');

        this.value = value;
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
