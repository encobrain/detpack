/**
 * Created by Encobrain on 31.10.16.
 */

function BaseType () {

}

function parseDefaultValue (text, index, newErrorFn) {
    throw new Error('.parseDefaultValue() is not defined');
}

function isCorrectOpts (opts) {
    throw new Error('.isCorrectOpts() is not defined');
}

BaseType.prototype.parseDefaultValue = parseDefaultValue;
BaseType.prototype.isCorrectOpts = isCorrectOpts;

module.exports = {
    Type: BaseType
};
