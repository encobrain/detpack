/**
 * Created by Encobrain on 01.11.16.
 */

var base = require('../../base'),
    CompilerOption = require('../../compiler/option').Option
    ;

function MapProp (structName) {
    base.Prop.call(this, structName);
}

function setCompilerOptions (options) {
    var self = this;

    function setOpts (opt) {
        if (opt instanceof CompilerOption) {
            var val = options[opt.name];

            if (val == null)
                throw new Error('Undefined "'+opt.name+'" compiler option in "'+self.structName+'.'+self.name+'" property');

            return val;
        }

        return opt;
    }

    function setDefaultOpts (opt, parent) {
        if (opt instanceof CompilerOption) {
            if (opt.name === 'null') return false;

            var v = options[opt.name];

            if (v == null) throw new Error('Undefined "'+opt.name+'" compiler option in ' + parent);

            return v;
        }

        function setArray (val, i) {
            return setDefaultOpts(val, parent + '.' + i);
        }

        function setObj (key) {
            opt[key] = setDefaultOpts(opt[key], parent + '.' + key);
        }

        if (opt instanceof Array) opt = opt.map(setArray);
        else if (opt && typeof opt === 'object') Object.keys(opt).forEach(setObj);

        return opt;
    }

    if (self.typeOpts) self.typeOpts = self.typeOpts.map(setOpts);

    if (self.listOpts) self.listOpts = self.listOpts.map(setOpts);

    if (self.default) self.default = setDefaultOpts(self.default, self.structName+'.'+self.name + '.default');
}

MapProp.prototype = new base.Prop();
MapProp.prototype.constructor = MapProp;

MapProp.prototype.name = null;
MapProp.prototype.typeName = null;
MapProp.prototype.typeOpts = null;
MapProp.prototype.listOpts = null;
MapProp.prototype.default = null;

MapProp.prototype.setCompilerOptions = setCompilerOptions;

module.exports = {
    Prop: MapProp
};
