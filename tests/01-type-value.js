/**
 * Created by encobrain on 17.11.16.
 */

var detpack = require('../index'),

    entities = [
        ['Uint', 1, [0x81]],
        ['Uint', 128, [0x00, 0x81]],
        ['Uint', 257, [0x01, 0x82]],
        ['Uint', 0xFFFFFFFFFFFFF000, [0x00,0x60,0x7F,0x7F,0x7F,0x7F,0x7F,0x7F,0x7F,0x81]],
        ['Uint', 0x100000000000000000, new Error()],
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
        ['Uint16', 'asdfasdf', new Error()],

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
        ['Uint64', 0x100000000000000000, new Error()],
        ['Uint64', -1, new Error()],
        ['Uint64', 'asdfasdf', new Error()],

        ['Int', 1, [0x81]],
        ['Int', 64, [0x40,0x80]],
        ['Int', 128, [0x00,0x81]],
        ['Int', 255, [0x7F,0x81]],
        ['Int', 0x1ffffffffffffe0000, [0x00,0x00,0x78,0x7F,0x7F,0x7F,0x7F,0x7F,0x7F,0xBF]],
        ['Int',-1, [0xFF]],
        ['Int',-64, [0xC0]],
        ['Int',-65, [0x3F,0xFF]],
        ['Int', -0x1ffffffffffffe0000, [0x00,0x00,0x08,0x00,0x00,0x00,0x00,0x00,0x00,0xC0]],
        ['Int', 0x3ffffffffffffe0000, new Error()],
        ['Int', new Error(), [0,0,0,0,0,0,0,0,0,0,0x80]],
        ['Int', 'asdfasdf', new Error()],

        ['Int8', 1, [0x01]],
        ['Int8', 127, [0x7F]],
        ['Int8', 128, new Error()],
        ['Int8', -1, [0xFF]],
        ['Int8', -128, [0x80]],
        ['Int8', -129, new Error()],
        ['Int8', 'asdfasdf', new Error()],

        ['Int16', 1, [0x01,0x00]],
        ['Int16', 255, [0xFF,0x00]],
        ['Int16', 256, [0x00,0x01]],
        ['Int16', 0x7FFF, [0xFF,0x7F]],
        ['Int16', 0x8000, new Error()],
        ['Int16', -1, [0xFF,0xFF]],
        ['Int16', -0x8000, [0x00,0x80]],
        ['Int16', -0x8001, new Error()],
        ['Int16', 'asdfasdf', new Error()],

        ['Int32', 1, [0x01,0x00,0x00,0x00]],
        ['Int32', 0xFF, [0xFF,0x00,0x00,0x00]],
        ['Int32', 0xFFFF, [0xFF,0xFF,0x00,0x00]],
        ['Int32', 0x10000, [0x00,0x00,0x01,0x00]],
        ['Int32', 0xFF0000, [0x00,0x00,0xFF,0x00]],
        ['Int32', 0x01000000, [0x00,0x00,0x00,0x01]],
        ['Int32', 0x7FFFFFFF, [0xFF,0xFF,0xFF,0x7F]],
        ['Int32', 0x80000000, new Error()],
        ['Int32', -1, [0xFF,0xFF,0xFF,0xFF]],
        ['Int32', -0x80, [0x80,0xFF,0xFF,0xFF]],
        ['Int32', -0x8000, [0x00,0x80,0xFF,0xFF]],
        ['Int32', -0x8000FF, [0x01,0xFF,0x7F,0xFF]],
        ['Int32', -0x80000000, [0x00,0x00,0x00,0x80]],
        ['Int32', -0x80000001, new Error()],
        ['Int32', 'asdfasdf', new Error()],

        ['Int64', 1, [0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00]],
        ['Int64', 0x0123456789ABCDF0, [0xF0,0xCD,0xAB,0x89,0x67,0x45,0x23,0x01]],
        ['Int64', -1, [0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]],
        ['Int64', -0x8000000000000000, [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x80]],
        ['Int64', 'asdfasdf', new Error()],

        ['Float16', 1, [0x00,0x3c]],
        ['Float16', 1.5, [0x00,0x3e]],
        ['Float16', 2047, [0xFF, 0x67]],
        ['Float16', 2048, [0x00, 0x68]],
        ['Float16', 2560, [0x00, 0x69]],
        ['Float16', 2050, [0x01, 0x68]],
        ['Float16', 32768, [0x00, 0x78]],
        ['Float16', 40960, [0x00, 0x79]],
        ['Float16', 32800, [0x01, 0x78]],
        ['Float16', NaN, [0xFF,0x7F]],
        ['Float16', Infinity, [0x00,0x7c]],
        ['Float16', -Infinity, [0x00,0xfc]],

        ['Float32', 1, [0x00,0x00,0x80,0x3F]],
        ['Float32', -1, [0x00,0x00,0x80,0xBF]],
        ['Float32', 1.2342339754104614, [0x61,0xFB,0x9D,0x3F]],
        ['Float32', 1000.3434448242188, [0xFB,0x15,0x7A,0x44]],
        ['Float32', -101234128, [0xBA,0x16,0xC1,0xCC]],
        ['Float32', 1323535360, [0x18,0xC7,0x9D,0x4E]],
        ['Float32', -12323.1240234375, [0x7F,0x8C,0x40,0xC6]],
        ['Float32', NaN, [0x00,0x00,0xC0,0x7F]],
        ['Float32', Infinity, [0x00,0x00,0x80,0x7F]],
        ['Float32', -Infinity, [0x00,0x00,0x80,0xFF]],

        ['Float64', 1, [0x00,0x00,0x00,0x00,0x00,0x00,0xF0,0x3F]],
        ['Float64', -1, [0x00,0x00,0x00,0x00,0x00,0x00,0xF0,0xBF]],
        ['Float64', 0.680489585, [0xDF,0xFE,0x1A,0x18,0x92,0xC6,0xE5,0x3F]],
        ['Float64', 74.494959, [0x18,0x77,0x83,0x68,0xAD,0x9F,0x52,0x40]],
        ['Float64', -2345423545, [0x00,0x00,0x20,0x57,0x8A,0x79,0xE1,0xC1]],
        ['Float64', 35423554235, [0x00,0x00,0x76,0x15,0xD1,0x7E,0x20,0x42]],
        ['Float64', -5425.123452364, [0xFE,0xF9,0x92,0x9A,0x1F,0x31,0xB5,0xC0]],
        ['Float64', NaN, [0x00,0x00,0x00,0x00,0x00,0x00,0xF8,0x7F]],
        ['Float64', Infinity, [0x00,0x00,0x00,0x00,0x00,0x00,0xF0,0x7F]],
        ['Float64', -Infinity, [0x00,0x00,0x00,0x00,0x00,0x00,0xF0,0xFF]],

        ['Bool', true, [0x80]],
        ['Bool', false, [0x00]],

        ['Num', 1, [0x00,0x01]],
        ['Num', 256, [0x10,0x00,0x01]],
        ['Num', 0x010203FF, [0x20,0xFF,0x03,0x02,0x01]],
        ['Num', 0x0102030405060700, [0x30,0x00,0x07,0x06,0x05,0x04,0x03,0x02,0x01]],
        ['Num', -1, [0x40,0xFF]],
        ['Num', -255, [0x50,0x01,0xFF]],
        ['Num', -65535, [0x60,0x01,0x00,0xFF,0xFF]],
        ['Num', -0xFFFFFFFF, [0x70,0x01,0x00,0x00,0x00,0xFF,0xFF,0xFF,0xFF]],
        ['Num', 1234.1234124, [0xA0,0xAF,0xF7,0xD1,0x5F,0x7E,0x48,0x93,0x40]],
        ['Num', -764.34434, [0xA0,0xA3,0x75,0x54,0x35,0xC1,0xE2,0x87,0xC0]],
        ['Num', Infinity, [0xC0]],
        ['Num', -Infinity, [0xD0]],
        ['Num', NaN, [0xE0]],

        ['Utf8', 23234, new Error()],
        ['Utf8', {}, new Error()],
        ['Utf8', 'TestString', [0x8A,0x54,0x65,0x73,0x74,0x53,0x74,0x72,0x69,0x6E,0x67]],
        ['Utf8', 'UTF8 աշխատանքները', [0x9D,0x55,0x54,0x46,0x38,0x20,0xD5,0xA1,0xD5,0xB7,
            0xD5,0xAD,0xD5,0xA1,0xD5,0xBF,0xD5,0xA1,0xD5,0xB6,
            0xD6,0x84,0xD5,0xB6,0xD5,0xA5,0xD6,0x80,0xD5,0xA8]],

        ['Bin', Buffer.from([0,1,2,3,4,5]), [0x86,0x00,0x01,0x02,0x03,0x04,0x05]],
        ['Bin', 'aasdf', new Error()],
        ['Bin', {}, new Error()],
        ['Bin', 123123, new Error()]
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
                    return test.ok(false, typeName + ' '+ value +' encode should fail');

                buf = Buffer.from(buf);

                test.equal(encodedBuf.length, buf.length, typeName + ' '+ value + ' encoded length correct');
                test.deepEqual(encodedBuf, buf, typeName + ' '+ value + ' encoded bytes correct');

            } catch (err) {
                if (buf instanceof Error) {
                    test.ok(!buf.message || buf.message === err.code, typeName + ' ' + value + ' encode should fail: ' + err.stack);
                } else test.ok(false, typeName + ' '+ value + ' encode should success: ' + err.stack);


            }
        }

        entities.forEach(encode);

        test.done();
    },

    'Decode': function (test) {

        function decode (entity) {
            var typeName = entity[0],
                value = entity[1],
                type = typeof typeName === 'string' ?
                    new (detpack.types[typeName])() :
                    typeName,

                encodedBuf = entity[2],
                rez;

            if (encodedBuf instanceof Error) return;

            try {
                rez = type.decode(Buffer.from(encodedBuf));

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
                    test.ok(!value.message || value.message === err.code, typeName + '['+encodedBuf+'] decode should fail: ' + err.stack)
                } else test.ok(false, typeName + '['+encodedBuf+'] decode should success: ' + err.stack);
            }
        }

        entities.forEach(decode);

        test.done();
    }
};
