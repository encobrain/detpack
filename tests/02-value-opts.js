/**
 * Created by encobrain on 24.11.16.
 */

var detpack = require('../index'),

    entities = [
        ['Uint', [-1,10], 5, new Error()],
        ['Uint', [10,Math.pow(2,71)], 25, new Error()],
        ['Uint', [10,255],  16, [0x90]],
        ['Uint', [10,255],  9, new Error()],
        ['Uint', [10,255],  255, new Error()],
        ['Uint', [10,255],  new Error(), [0x7F,0x81]],
        ['Uint', [10,255],  254, [0x7E,0x81]],
        ['Uint', [10,255],  new Error(), [0x7F,0x00,0x80]],

        ['Uint8', [-1,10], 5, new Error()],
        ['Uint8', [10,257], 15, new Error()],
        ['Uint8', [10,255],  16, [0x10]],
        ['Uint8', [10,255],  9, new Error()],
        ['Uint8', [10,255],  255, new Error()],
        ['Uint8', [10,255],  new Error(), [0xFF]],
        ['Uint8', [10,255],  254, [0xFE]],

        ['Uint16', [-1,10], 5, new Error()],
        ['Uint16', [10,65537], 15, new Error()],
        ['Uint16', [10,65535],  16, [0x10,0x00]],
        ['Uint16', [10,65535],  9, new Error()],
        ['Uint16', [10,65535],  65535, new Error()],
        ['Uint16', [10,65535],  new Error(), [0xFF,0xFF]],
        ['Uint16', [10,65535],  65534, [0xFE,0xFF]],

        ['Uint32', [-1, 10], 5, new Error()],
        ['Uint32', [10,0x100000001], 15, new Error()],
        ['Uint32', [10,255],  16, [0x10,0x00,0x00,0x00]],
        ['Uint32', [10,255],  9, new Error()],
        ['Uint32', [10,255],  255, new Error()],
        ['Uint32', [10,255],  new Error(), [0xFF,0x00,0x00,0x00]],
        ['Uint32', [10,255],  254, [0xFE,0x00,0x00,0x00]],

        ['Uint64', [-1, 10], 5, new Error()],
        ['Uint64', [10,Math.pow(2,65)], 15, new Error()],
        ['Uint64', [10,255],  16, [0x10,0x00,0x00,0x00,0x00,0x00,0x00,0x00]],
        ['Uint64', [10,255],  9, new Error()],
        ['Uint64', [10,255],  255, new Error()],
        ['Uint64', [10,255],  new Error(), [0xFF,0x00,0x00,0x00,0x00,0x00,0x00,0x00]],
        ['Uint64', [10,255],  254, [0xFE,0x00,0x00,0x00,0x00,0x00,0x00,0x00]],

        ['Int', [-Math.pow(2,70),10], 5, new Error()],
        ['Int', [10,Math.pow(2,70)], 15, new Error()],
        ['Int', [-10,63], 16, [0x90]],
        ['Int', [-10,63], 63, new Error()],
        ['Int', [-10,64], 63, [0xBF]],
        ['Int', [-10,65], 64, [0x40,0x80]],
        ['Int', [-10,63], -10, [0xF6]],
        ['Int', [-10,63], -11, new Error()],
        ['Int', [-10,63], new Error(), [0x00,0x80]],

        ['Int8', [-129,10], 5, new Error()],
        ['Int8', [-10,129], 15, new Error()],
        ['Int8', [-10,63], 16, [0x10]],
        ['Int8', [-10,63], 64, new Error()],
        ['Int8', [-128,0], -128, [0x80]],
    ]
    ;



module.exports = {
    'Encode': function (test) {

        function encode (entity) {
            var typeName = entity[0],
                opts = entity[1],
                value = entity[2],
                buf = entity[3],
                type = new (detpack.types[typeName])(),

                encodedBuf;

            if (value instanceof Error) return;

            try {
                type.setOpts(opts);

                encodedBuf = type.encode(value);

                if (buf instanceof Error)
                    return test.ok(false, typeName + ' '+ value +' encode should fail');

                buf = new Buffer(buf);

                test.equal(encodedBuf.length, buf.length, typeName + ' '+ value + ' encoded length correct');
                test.deepEqual(encodedBuf, buf, typeName + ' '+ value + ' encoded bytes correct');

            } catch (err) {
                if (buf instanceof Error) {
                    test.ok(!buf.message || buf.message === err.code, typeName + ' ' + value +' encode should fail: ' + err);
                } else test.ok(false, typeName + ' '+ value + ' encode should success: ' + err);


            }
        }

        entities.forEach(encode);

        test.done();
    },

    'Decode': function (test) {

        function decode (entity) {
            var typeName = entity[0],
                opts = entity[1],
                value = entity[2],
                type = new (detpack.types[typeName])(),

                encodedBuf = entity[3],
                rez;

            if (encodedBuf instanceof Error) return;

            try {
                type.setOpts(opts);

                rez = type.decode(new Buffer(encodedBuf));

                if (value instanceof Error)
                    return test.ok(false, typeName + '['+encodedBuf+'] decode should fail');

                switch (typeof value) {
                    case 'number':
                        if (Number.isNaN(value)) {
                            test.ok(Number.isNaN(rez),  typeName + '['+encodedBuf+'] decoded NaN correct');
                            break;
                        }
                    case 'string':
                    case 'boolean':
                        test.equal(rez, value, typeName + '['+encodedBuf+'] decoded value correct');
                        break;
                    case 'object':
                        test.deepEqual(rez, value, typeName + '['+encodedBuf+'] decoded value correct');
                        break;
                    default:
                        test.ok(false, typeName + '['+encodedBuf+'] typeof should be invalid');
                }
            } catch (err) {
                if (value instanceof Error) {
                    test.ok(!value.message || value.message === err.code, typeName + '['+encodedBuf+'] decode should fail: ' + err);
                } else test.ok(false, typeName + '['+encodedBuf+'] decode should success: ' + err);
            }
        }

        entities.forEach(decode);

        test.done();
    }
};
