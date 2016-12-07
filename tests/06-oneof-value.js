/**
 * Created by encobrain on 07.12.16.
 */

var detpack = require('../index'),

    oneofSchema = detpack.compiler.compileFileSync(__dirname+'/schemas/oneof.detpack'),

    Message = oneofSchema.Message,

    entities = [
        [Message, 1, new Error()],
        [Message, 'STR', [0x00]],
        [Message, 10, [0x20]],
        [Message, 20, [0x40]],
        [Message, {}, new Error()],
        [Message, {name: 'foo'}, [0x60,0x83,0x66,0x6f,0x6f], {name: 'foo', __type__: 'User'}],
        [Message, {id:10, rqData: 'abc'}, [0x80,0x8a,0x83,0x61,0x62,0x63], {id: 10, rqData: 'abc', __type__:'Req'}],
        [Message, {id:20, rsData: 'cde'}, [0xa0,0x94,0x83,0x63,0x64,0x65], {id: 20, rsData: 'cde', __type__:'Res'}],
        [Message, new Error(), [0xF0,0x94,0x83,0x63,0x64,0x65]]
    ]
    ;



module.exports = {
    'Encode': function (test) {

        function encode (entity) {
            var type = new (entity[0])(),
                typeName = type.constructor.name,
                value = entity[1],
                buf = entity[2],

                encodedBuf;

            if (value instanceof Error) return;

            try {
                encodedBuf = type.encode(value);

                if (buf instanceof Error)
                    return test.ok(false, typeName + ' '+ JSON.stringify(value) +' encode should fail');

                buf = Buffer.from(buf);

                test.equal(encodedBuf.length, buf.length, typeName + ' '+ JSON.stringify(value) + ' encoded length correct');
                test.deepEqual(encodedBuf, buf, typeName + ' '+ JSON.stringify(value) + ' encoded bytes correct');

            } catch (err) {
                if (buf instanceof Error) {
                    test.ok(!buf.message || buf.message === err.code, typeName + ' ' + JSON.stringify(value) + ' encode should fail: ' + err.stack);
                } else test.ok(false, typeName + ' '+ JSON.stringify(value) + ' encode should success: ' + err.stack);


            }
        }

        entities.forEach(encode);

        test.done();
    },

    'Decode': function (test) {

        function decode (entity) {
            var type = new (entity[0])(),
                typeName = type.constructor.name,
                value = entity[3] || entity[1],

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
