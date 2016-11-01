/**
 * Created by Encobrain on 01.11.16.
 */


function BaseProp () {}

function setCompilerOptions (options) {
    throw new Error ('.setCompilerOptions() is not defined');
}

BaseProp.prototype.setCompilerOptions = setCompilerOptions;

module.exports = {
    Prop: BaseProp
};

