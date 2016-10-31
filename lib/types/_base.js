/**
 * Created by Encobrain on 31.10.16.
 */

function BaseType () {

}

function isCorrectDefaultValue (value) {
    throw new Error('.parseDefaultValue() is not defined');
}

function isCorrectOpts (opts) {
    throw new Error('.isCorrectOpts() is not defined');
}

BaseType.prototype.isCorrectDefaultValue = isCorrectDefaultValue;
BaseType.prototype.isCorrectOpts = isCorrectOpts;

module.exports = {
    Type: BaseType
};
