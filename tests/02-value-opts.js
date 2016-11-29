/**
 * Created by encobrain on 24.11.16.
 */

var detpack = require('../index'),

    entities = [
        ['Uint', [10,255],  15, [0x8F]],
        ['Uint', [10,255],  9, new Error()],
        ['Uint', [10,255],  255, new Error()],
        ['Uint', [10,255],  new Error(), [0x7F,0x81]],
        ['Uint', [10,255],  254, [0x7E,0x81]],
        ['Uint', [10,255],  new Error(), [0x7F,0x00,0x80]],




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
                    return test.ok(false, typeName + ' '+ entity[1] +' encode should fail');

                buf = new Buffer(buf);

                test.equal(encodedBuf.length, buf.length, typeName + ' '+ entity[1] + ' encoded length correct');
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
