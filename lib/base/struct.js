/**
 * Created by Encobrain on 01.11.16.
 */

function BaseStruct () {
    Array.call(this)
}

function compileStruct (compilerOptions) {
    throw new Error('.compile() is not defined');
}

BaseStruct.prototype = [];
BaseStruct.prototype.constructor = BaseStruct;

BaseStruct.prototype.compile = compileStruct;


module.exports = {
    Struct: BaseStruct
};