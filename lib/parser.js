/**
 * Created by Encobrain on 30.10.16.
 * Detpack syntax parser
 */

var OneofType = require('./types/oneof').Type,
    OneofProp = require('./types/oneof').Property,
    MapType = require('./types/map').Type,
    MapProp = require('./types/map').Property,
    defaultTypes = require('./types')
    ;

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

    function newError (errorText, allText, curPos) {
        allText = allText || text;
        curPos = curPos||i;

        var lines = allText.slice(0, curPos+1).split('\n');

        return new Error(errorText + ' at ' + lines.length + ':' + lines[lines.length-1].length);
    }

    function skipSpacesAndComments () {
        while (true) {
            while (c === ' ' || c === '\t' || c === '\n' || c === '\r') c = text[++i];

            if (c === '/' && text[i+1] === '/') {
                c = text[i+=2];
                while (c !== '\n' && c !== '\r') c = text[++i];
            } else break;

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

        var num = 0, is = isDec, fract = 1;

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

        function isFract () {
            if (c>='0'&& c<='9') {
                num = num * 10 + (+c);

                fract*=10;

                return true;
            }
        }

        if (c === '0') {
            switch (text[i+1]) {
                case '.': c=text[i+=2]; is = isFract; break;
                case 'x': c=text[i+=2]; is = isHex; break;
                case 'b': c=text[i+=2]; is = isBin; break;
                case 'o': c=text[i+=2]; is = isOct; break;
            }
        }

        while (is()) c = text[++i];

        return is === isFract ? num / fract : num;
    }

    function getOpts () {
        c = text[++i];

        var opts = [], opt;

        while (true) {
            skipSpacesAndComments();

            if (c>='0'&&c<='9') opt = getNumber();
            else if (c==='"' || c === "'") opt = getString();
            else if (!/[a-z]/i.test(c)) opt = null;
            else opt = new CompileOption(getName());

            opts.push(opt);

            skipSpacesAndComments();

            if (c === ']') break;

            if (c !== ',') throw newError('Expected ","');

            c = text[++i];
        }

        c = text[++i];

        return opts;
    }

    function getDefault () {

    }

    function setOneofType (typeName) {
        c = text[++i];

        var props = new OneofType(),
            index = 0,
            prop;

        function setValue (parseFn) {
            prop.type = 'STATIC';
            prop.value = parseFn();
        }

        while (true) {
            skipSpacesAndComments();

            prop = new OneofProp();

            prop.index = index;

            if (c === '"' || c === "'") setValue(getString);
            else if (c >= '0' && c <= '9') setValue(getNumber);
            else {
                var name = getName();

                if (!types[name]) {
                    prop.type = 'STATIC';
                    prop.value = new CompileOption(name);
                } else {
                    prop.type = 'TYPE';
                    prop.name = name;
                }
            }

            props[index++] = prop;

            skipSpacesAndComments();

            if (c === ']') break;

            if (c !== ',') throw newError('Expected ","');

            c = text[++i];
        }

        c = text[++i];

        types[typeName] = props;
    }

    function setObjType (typeName) {
        c = text[++i];

        var props = new MapType(), prop;

        while (true) {
            skipSpacesAndComments();

            prop = new MapProp();

            prop.typeName = getName();

            var type = types[prop.typeName] || defaultTypes[prop.typeName];

            if (!type) throw newError('Unknown type "'+prop.typeName+'"');

            if (c === '[') prop.typeOpts = getOpts();

            skipSpacesAndComments();

            prop.name = getName();

            if (c ===  '[') prop.listOpts = getOpts();

            skipSpacesAndComments();

            if (c === '=') {
                c = text[++i];

                skipSpacesAndComments();

                prop.default = getDefault();
            }

            if (c !== ';') throw newError('Expected ";"');

            props[prop.name] = prop;

            c = text[++i];

            skipSpacesAndComments();

            if (c === '}') break;
        }

        c = text[++i];

        types[typeName] = props;
    }

    while (i < l) {

        skipSpacesAndComments();

        var name = getName();

        skipSpacesAndComments();

        switch (c) {
            case '{': setObjType(name); break;
            case '[': setOneofType(name); break;
            default: throw newError('Unknown type of constructor "'+c+'"');
        }
    }

    return types;
}

module.exports = {
    CompileOption: CompileOption,
    parse: parse
};
