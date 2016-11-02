/**
 * Created by Encobrain on 01.11.16.
 */

function BaseStruct (name) {
    this.name = name;
    this.props = [];
}

function compileStruct (types, compilerOptions) {
    throw new Error('.compile() is not defined');
}

BaseStruct.prototype.name = null;
BaseStruct.prototype.props = null;
BaseStruct.prototype.compile = compileStruct;


module.exports = {
    Struct: BaseStruct
};