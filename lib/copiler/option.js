/**
 * Created by Encobrain on 01.11.16.
 */


function CompilerOption (name) {
    this.name = name;
}

CompilerOption.prototype.name = null;

module.exports = {
    Option: CompilerOption
}