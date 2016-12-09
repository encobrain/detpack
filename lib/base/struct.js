/**
 * Created by Encobrain on 01.11.16.
 */

function BaseStruct (id, name) {
    this.id = id;
    this.name = name;
    this.props = [];
}

function createType (types, compilerOptions) {
    throw new Error('.createType() is not defined');
}

BaseStruct.prototype.id = null;
BaseStruct.prototype.name = null;
BaseStruct.prototype.props = null;
BaseStruct.prototype.createType = createType;


module.exports = {
    Struct: BaseStruct
};