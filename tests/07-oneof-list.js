/**
 * Created by encobrain on 07.12.16.
 */

var detpack = require('../index'),

    oneofSchema = detpack.compiler.compileFileSync(__dirname+'/schemas/oneof.detpack'),

    Message = oneofSchema.Message,

    entities = [
        [Message, [-1,6], [10,20,'STR'], new Error()],
        [Message, [2,6], [10], new Error()],
        [Message, [2,6], [20,10,'STR',{id:10,rqData:'abc'},{name:'foo'},{id:20,rsData:'cde'}],
            [0x86,0x44,0x47,0x8a,0x83,0x61,0x62,0x63,0x83,0x66,0x6f,0x6f,0x40,0x94,0x83,0x63,0x64,0x65],
            [20,10,'STR',{id:10,rqData:'abc',__type__:'Req'},{name:'foo',__type__:'User'},{id:20,rsData:'cde',__type__:'Res'}]]
    ]
    ;



module.exports = {
    'Encode': function (test) {

        function encode (entity) {
            var type = new (entity[0])(),
                opts = entity[1],
                typeName = type.constructor.name,
                value = entity[2],
                buf = entity[3],

                encodedBuf;

            if (value instanceof Error) return;

            try {
                type.setListOpts(opts);

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
                opts = entity[1],
                typeName = type.constructor.name,
                value = entity[4] || entity[2],

                encodedBuf = entity[3],
                rez;

            if (encodedBuf instanceof Error) return;

            try {
                type.setListOpts(opts);

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
