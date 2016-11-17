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
        ['Uint', new Error(), [0,0,0,0,0,0,0,0,0,0,0x80]]
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
                    return test.ok(false, typeName + entity[1] +' encode fail');

                buf = new Buffer(buf);

                test.ok(encodedBuf.length === buf.length, typeName + ' encoded length correct');
                test.deepEqual(encodedBuf, buf, typeName + ' encoded bytes correct');

            } catch (err) {
                if (buf instanceof Error) {
                    test.ok(!buf.message || buf.message === err.code, typeName + entity[1] +' encode fail');
                } else test.ok(false, typeName + ' encode success');


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
                    return test.ok(false, typeName + '['+encodedBuf+'] decode fail');

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
                    test.ok(!value.message || value.message === err.code, typeName + '['+encodedBuf+'] decode fail')
                } else test.ok(false, typeName + '['+encodedBuf+'] decode success');
            }
        }

        entities.forEach(decode);

        test.done();
    }
};
