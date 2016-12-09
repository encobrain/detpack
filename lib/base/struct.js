/**
 * Created by Encobrain on 01.11.16.
 */

function BaseStruct (name) {
    this.name = name;
    this.props = [];
}

function createType (types, compilerOptions) {
    throw new Error('.createType() is not defined');
}

BaseStruct.prototype.name = null;
BaseStruct.prototype.props = null;
BaseStruct.prototype.createType = createType;


module.exports = {
    Struct: BaseStruct
};