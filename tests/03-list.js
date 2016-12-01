/**
 * Created by encobrain on 01.12.16.
 */

var detpack = require('../index'),

    entities = [
        ['Uint', [-1,5], [1,2], new Error()],
        ['Uint', [2,3], [1], new Error()],
        ['Uint', [2,3], [1,2,3], [0x83,0x81,0x82,0x83]],
        ['Uint', [2,3], [1,2,3,4], new Error()],
        ['Uint', [2,3], new Error(), [0x85]],

        ['Uint8', [-1,5], [1,2], new Error()],
        ['Uint8', [2,3], [1], new Error()],
        ['Uint8', [2,3], [1,2,3], [0x83,0x01,0x02,0x03]],
        ['Uint8', [2,3], [1,2,3,4], new Error()],
        ['Uint8', [2,3], new Error(), [0x85]],

        ['Uint16', [-1,5], [1,2], new Error()],
        ['Uint16', [2,3], [1], new Error()],
        ['Uint16', [2,3], [1,2,3], [0x83,0x01,0x00,0x02,0x00,0x03,0x00]],
        ['Uint16', [2,3], [1,2,3,4], new Error()],
        ['Uint16', [2,3], new Error(), [0x85]],

        ['Uint32', [-1,5], [1,2], new Error()],
        ['Uint32', [2,3], [1], new Error()],
        ['Uint32', [2,3], [1,2,3], [0x83,0x01,0x00,0x00,0x00,0x02,0x00,0x00,0x00,0x03,0x00,0x00,0x00]],
        ['Uint32', [2,3], [1,2,3,4], new Error()],
        ['Uint32', [2,3], new Error(), [0x85]],

        ['Uint64', [-1,5], [1,2], new Error()],
        ['Uint64', [2,3], [1], new Error()],
        ['Uint64', [2,3], [1,2,3], [0x83,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x02,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x03,0x00,0x00,0x00,0x00,0x00,0x00,0x00]],
        ['Uint64', [2,3], [1,2,3,4], new Error()],
        ['Uint64', [2,3], new Error(), [0x85]],

        ['Int', [-1,5], [1,2], new Error()],
        ['Int', [2,3], [1], new Error()],
        ['Int', [2,3], [1,2,3], [0x83,0x81,0x82,0x83]],
        ['Int', [2,3], [1,2,3,4], new Error()],
        ['Int', [2,3], new Error(), [0x85]],

        ['Int8', [-1,5], [1,2], new Error()],
        ['Int8', [2,3], [1], new Error()],
        ['Int8', [2,3], [1,2,3], [0x83,0x01,0x02,0x03]],
        ['Int8', [2,3], [1,2,3,4], new Error()],
        ['Int8', [2,3], new Error(), [0x85]],

        ['Int16', [-1,5], [1,2], new Error()],
        ['Int16', [2,3], [1], new Error()],
        ['Int16', [2,3], [1,2,3], [0x83,0x01,0x00,0x02,0x00,0x03,0x00]],
        ['Int16', [2,3], [1,2,3,4], new Error()],
        ['Int16', [2,3], new Error(), [0x85]],

        ['Int32', [-1,5], [1,2], new Error()],
        ['Int32', [2,3], [1], new Error()],
        ['Int32', [2,3], [1,2,3], [0x83,0x01,0x00,0x00,0x00,0x02,0x00,0x00,0x00,0x03,0x00,0x00,0x00]],
        ['Int32', [2,3], [1,2,3,4], new Error()],
        ['Int32', [2,3], new Error(), [0x85]],

        ['Int64', [-1,5], [1,2], new Error()],
        ['Int64', [2,3], [1], new Error()],
        ['Int64', [2,3], [1,2,3], [0x83,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x02,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x03,0x00,0x00,0x00,0x00,0x00,0x00,0x00]],
        ['Int64', [2,3], [1,2,3,4], new Error()],
        ['Int64', [2,3], new Error(), [0x85]],

        ['Float16', [-1,5], [1,2], new Error()],
        ['Float16', [2,3], [1], new Error()],
        ['Float16', [2,3], [1,2,3], [0x83,0x00,0x3C,0x00,0x40,0x00,0x42]],
        ['Float16', [2,3], [1,2,3,4], new Error()],
        ['Float16', [2,3], new Error(), [0x85]],

        ['Float32', [-1,5], [1,2], new Error()],
        ['Float32', [2,3], [1], new Error()],
        ['Float32', [2,3], [1,2,3], [0x83,0x00,0x00,0x80,0x3F,0x00,0x00,0x00,0x40,0x00,0x00,0x40,0x40]],
        ['Float32', [2,3], [1,2,3,4], new Error()],
        ['Float32', [2,3], new Error(), [0x85]],

        ['Float64', [-1,5], [1,2], new Error()],
        ['Float64', [2,3], [1], new Error()],
        ['Float64', [2,3], [1,2,3], [0x83,0x00,0x00,0x00,0x00,0x00,0x00,0xf0,0x3F,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x40,0x00,0x00,0x00,0x00,0x00,0x00,0x08,0x40]],
        ['Float64', [2,3], [1,2,3,4], new Error()],
        ['Float64', [2,3], new Error(), [0x85]],
    ]
    ;



module.exports = {
    'Encode': function (test) {

        function encode (entity) {
            var typeName = entity[0],
                opts = entity[1],
                values = entity[2],
                buf = entity[3],
                type = new (detpack.types[typeName])(),

                encodedBuf;

            if (values instanceof Error) return;

            try {
                type.setListOpts(opts);

                encodedBuf = type.encode(values);

                if (buf instanceof Error)
                    return test.ok(false, typeName + ' ['+ values +'] encode should fail');

                buf = Buffer.from(buf);

                test.equal(encodedBuf.length, buf.length, typeName + ' ['+ values + '] encoded length correct');
                test.deepEqual(encodedBuf, buf, typeName + ' ['+ values + '] encoded bytes correct');

            } catch (err) {
                if (buf instanceof Error) {
                    test.ok(!buf.message || buf.message === err.code, typeName + ' [' + values +'] encode should fail: ' + err);
                } else test.ok(false, typeName + ' ['+ values + '] encode should success: ' + err);


            }
        }

        entities.forEach(encode);

        test.done();
    },

    'Decode': function (test) {

        function decode (entity) {
            var typeName = entity[0],
                opts = entity[1],
                values = entity[2],
                type = new (detpack.types[typeName])(),

                encodedBuf = entity[3],
                rez;

            if (encodedBuf instanceof Error) return;

            try {
                type.setListOpts(opts);

                rez = type.decode(Buffer.from(encodedBuf));

                if (values instanceof Error)
                    return test.ok(false, typeName + '['+encodedBuf+'] decode should fail');

                test.deepEqual(rez, values, typeName + '['+encodedBuf+'] decoded value correct');
            } catch (err) {
                if (values instanceof Error) {
                    test.ok(!values.message || values.message === err.code, typeName + '['+encodedBuf+'] decode should fail: ' + err);
                } else test.ok(false, typeName + '['+encodedBuf+'] decode should success: ' + err);
            }
        }

        entities.forEach(decode);

        test.done();
    }
};
