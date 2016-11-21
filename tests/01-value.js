/**
 * Created by encobrain on 17.11.16.
 */

var detpack = require('../index'),

    entities = [
        ['Uint', 1, [0x81]],
        ['Uint', 128, [0x00, 0x81]],
        ['Uint', 257, [0x01, 0x82]],
        ['Uint', 0x3ffffffffffffe0000, [0x00,0x00,0x78,0x7F,0x7F,0x7F,0x7F,0x7F,0x7F,0xFF]],
        ['Uint', 0x400000000000000000, new Error()],
        ['Uint', 'asdfasdf', new Error()],
        ['Uint', new Error(), [0,0,0,0,0,0,0,0,0,0,0x80]],

        ['Uint8', 1, [0x01]],
        ['Uint8', 0xFF, [0xFF]],
        ['Uint8', 0x100, new Error()],
        ['Uint8', -1, new Error()],

        ['Uint16', 1, [0x01,0x00]],
        ['Uint16', 255, [0xFF,0x00]],
        ['Uint16', 256, [0x00,0x01]],
        ['Uint16', 0xABCD, [0xCD,0xAB]],
        ['Uint16', 0x10000, new Error()],
        ['Uint16', -1, new Error()],
        ['Uint32', 'asdfasdf', new Error()],

        ['Uint32', 1, [0x01,0x00,0x00,0x00]],
        ['Uint32', 255, [0xFF,0x00,0x00,0x00]],
        ['Uint32', 0x10000, [0x00,0x00,0x01,0x00]],
        ['Uint32', 0x01234567, [0x67,0x45,0x23,0x01]],
        ['Uint32', 0x100000000, new Error()],
        ['Uint32', -1, new Error()],
        ['Uint32', 'asdfasdf', new Error()],

        ['Uint64', 1, [0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00]],
        ['Uint64', 255, [0xFF,0x00,0x00,0x00,0x00,0x00,0x00,0x00]],
        ['Uint64', 0x100000000, [0x00,0x00,0x00,0x00,0x01,0x00,0x00,0x00]],
        ['Uint64', 0x0123456789ABCDE0, [0xE0,0xCD,0xAB,0x89,0x67,0x45,0x23,0x01]],
        ['Uint64', 0x10000000000000000, new Error()],
        ['Uint64', -1, new Error()],
        ['Uint64', 'asdfasdf', new Error()],

        ['Int', 1, [0x81]],
        ['Int', 128, [0x00,0x81]],
        ['Int', 255, [0x7F,0x81]],
        ['Int', 0x1ffffffffffffe0000, [0x00,0x00,0x78,0x7F,0x7F,0x7F,0x7F,0x7F,0x7F,0xBF]],
        ['Int',-1, [0xFF]],
        ['Int',-64, [0xC0]],
        ['Int',-65, [0x3F,0xFF]],
        ['Int', -0x1ffffffffffffe0000, [0x00,0x00,0x08,0x00,0x00,0x00,0x00,0x00,0x00,0xC0]],
        ['Int', 0x3ffffffffffffe0000, new Error()],
        ['Int', new Error(), [0,0,0,0,0,0,0,0,0,0,0x80]],
        ['Uint64', 'asdfasdf', new Error()],

    ]
    ;



module.exports = {
    'Encode': function (test) {

        function encode (entity) {
            var typeName = entity[0],
                value = entity[1],
                buf = entity[2],
                type = new (detpack.types[typeName])(),

                encodedBuf;

            if (value instanceof Error) return;

            try {
                encodedBuf = type.encode(value);

                if (buf instanceof Error)
                    return test.ok(false, typeName + ' '+ entity[1] +' encode should fail');

                buf = new Buffer(buf);

                test.ok(encodedBuf.length === buf.length, typeName + ' '+ entity[1] + ' encoded length correct');
                test.deepEqual(encodedBuf, buf, typeName + ' '+ entity[1] + ' encoded bytes correct');

            } catch (err) {
                if (buf instanceof Error) {
                    test.ok(!buf.message || buf.message === err.code, typeName + entity[1] +' encode should fail');
                } else test.ok(false, typeName + ' '+ entity[1] + ' encode should success');


            }
        }

        entities.forEach(encode);

        test.done();
    },

    'Decode': function (test) {

        function decode (entity) {
            var typeName = entity[0],
                value = entity[1],
                type = new (detpack.types[typeName])(),

                encodedBuf = entity[2],
                rez;

            if (encodedBuf instanceof Error) return;

            try {
                rez = type.decode(new Buffer(encodedBuf));

                if (value instanceof Error)
                    return test.ok(false, typeName + '['+encodedBuf+'] decode should fail');

                switch (typeof value) {
                    case 'number':
                    case 'string':
                    case 'boolean':
                        test.ok(rez === value, typeName + '['+encodedBuf+'] decoded value correct');
                        break;
                    case 'object':
                        test.deepEqual(rez, value, typeName + '['+encodedBuf+'] decoded value correct');
                    default:
                        test.ok(false, typeName + '['+encodedBuf+'] typeof should be invalid');
                }
            } catch (err) {
                if (value instanceof Error) {
                    test.ok(!value.message || value.message === err.code, typeName + '['+encodedBuf+'] decode should fail')
                } else test.ok(false, typeName + '['+encodedBuf+'] decode should success');
            }
        }

        entities.forEach(decode);

        test.done();
    }
};
