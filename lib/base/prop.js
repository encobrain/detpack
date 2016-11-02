/**
 * Created by Encobrain on 01.11.16.
 */


function BaseProp (structName) {
    this.structName = structName;
}

function setCompilerOptions (options) {
    throw new Error ('.setCompilerOptions() is not defined');
}

BaseProp.prototype.structName = null;

BaseProp.prototype.setCompilerOptions = setCompilerOptions;

module.exports = {
    Prop: BaseProp
};

