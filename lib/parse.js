/**
 * Created by Encobrain on 30.10.16.
 * Detpack syntax parser
 */

function OneofProperty () {}

OneofProperty.prototype.index = null; // 0,1,...
OneofProperty.prototype.type = null; // 'STATIC', 'TYPE'
OneofProperty.prototype.name = null;  // for TYPE
OneofProperty.prototype.value = null; // for STATIC

function MapProperty () {}

MapProperty.prototype.name = null;
MapProperty.prototype.typeName = null;
MapProperty.prototype.typeOpts = null;
MapProperty.prototype.listOpts = null;
MapProperty.prototype.default = null;

function CompileOption (name) { this.name = name; }

CompileOption.prototype.name = null;

/**
 * Parser
 * @param {String} text Text with sytax of types
 * @return {Object} Object with types
 */
function parse (text) {
    var i = 0, l = text.length, c = text[i],
        types = {};

    function newError (errorText) {
        var lines = text.slice(0, c+1).split('\n');

        return new Error(errorText + ' at ' + lines.length + ':' + lines[lines.length-1].length);
    }

    function skipSpacesAndComments () {
        while (true) {
            if (c === '\\' && text[i+1] === '\\') {
                c = text[i+=2];
                while (c !== '\n' && c !== '\r') c = text[++i];
            }

            if (c !== ' ' && c !== '\t' && c !== '\n' && c !== '\r') break;

            c = text[++i];

            if (i>l) throw newError('Unexpected end');
        }
    }

    function getName () {
        var from = i;

        if (!/[a-z]/i.test(c)) throw newError('Incorrect name symbol');

        while (/[a-z0-9_]/i.test(c)) {
            c = text[++i];
            if (i>l) throw newError('Unexpected end');
        }

        return text.slice(from, i);
    }

    function getString () {
        var qt = c, from = ++i;

        c = text[i];

        while (c !== qt) {
            if (c === '\\') i++;
            c = text[++i];
            if (i>l) throw newError('Unexpected end');
        }

        c = text[++i];

        return text.slice(from, i-1);
    }



    function getNumber () {

        var num = 0, is = isDec;

        function isDec () {
            if (c>='0' && c<='9') {
                num = num * 10 + (+c);
                return true;
            }
        }

        function isHex () {
            if (c>='0' && c<='9') {
                num = num * 16 + (+c);
                return true;
            }
            c=c.toLowerCase();
            if (c>='a' && c <= 'f') {
                num = num * 16 + (c.charCodeAt(0)-87);
                return true;
            }
        }

        function isBin () {
            if (c==='0' || c === '1') {
                num = num * 2 + (+c);
                return true;
            }
        }

        function isOct () {
            if (c>='0'&& c<='7') {
                num = num * 8 + (+c);
                return true;
            }
        }

        if (c === '0') {
            switch (text[i+1]) {
                case 'x': c=text[i+=2]; is = isHex; break;
                case 'b': c=text[i+=2]; is = isBin; break;
                case 'o': c=text[i+=2]; is = isOct; break;
            }
        }

        while (is()) c = text[++i];

        return num;
    }

    function setOneofType (typeName) {
        c = text[++i];

        var props = [], prop;

        function setValue (parseFn) {
            prop.type = 'STATIC';
            prop.value = parseFn();
        }

        while (c !== ']') {
            skipSpacesAndComments();

            prop = new OneofProperty();

            prop.index = props.length;
            props.push(prop);


            if (c === '"' || c === '"') setValue(getString);
            else if (c >= '0' && c <= '9') setValue(getNumber);
            else {
                prop.name = getName();
                prop.value = types[prop.name];

                if (!prop.value) throw newError('Unknown type "' + prop.name + '"');
            }

            skipSpacesAndComments();

            if (c !== ',' && c !== ']') throw newError('Expected "," or "]"');

            c = text[++i];

            skipSpacesAndComments()
        }

        types[typeName] = props;
    }

    while (i < l) {

        skipSpacesAndComments();

        var name = getName();

        skipSpacesAndComments();

        switch (c) {
            case '{': setObjType(name); break;
            case '[': setOneofType(name); break;
            default: throw newError('Unknown type of constructor');
        }
    }

    return types;
}

module.exports = {
    OneofProperty: OneofProperty,
    MapProperty: MapProperty,
    CompileOption: CompileOption,
    parse: parse
};
