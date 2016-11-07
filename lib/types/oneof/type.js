/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../base');

function OneofType (indexFn, values) {
    base.Type.call(this);
}

OneofType.prototype = new base.Type();
OneofType.prototype.constructor = OneofType;

function setOpts (opts) {
    throw new Error ('Oneof type cant have options');
}

function setListOpts (opts) {

}

OneofType.prototype.setOpts = setOpts;
OneofType.prototype.setListOpts = setListOpts;


module.exports = {
    Type: OneofType
};
