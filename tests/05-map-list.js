/**
 * Created by encobrain on 07.12.16.
 */

var detpack = require('../index'),

    mapSchema = detpack.compiler.compileFileSync(__dirname+'/schemas/map.detpack'),

    user = new mapSchema.User(),

    entities = [
        [user, [-1,5], [{name:'foo',age:10,items:[]}], new Error()],
        [user, [2,5], [{name:'foo',age:10,items:[]}], new Error()],
        [user, [2,5], [{name:'foo1',age:10,items:['a','b']},{name:'foo2',age:20,items:['c','d']}], 
            [0x82,0x84,0x66,0x6f,0x6f,0x31,0x8a,0x82,0x81,0x61,0x81,0x62,0x84,0x66,0x6f,0x6f,0x32,0x94,0x82,0x81,0x63,0x81,0x64]],
    ]
    ;



module.exports = {
    'Encode': function (test) {

        function encode (entity) {
            var type = entity[0],
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
            var type = entity[0],
                typeName = type.constructor.name,
                value = entity[4] || entity[2],

                encodedBuf = entity[3],
                rez;

            if (encodedBuf instanceof Error) return;

            try {
                rez = type.decode(Buffer.from(encodedBuf));

                function delType(item) { delete item.__type__; }

                rez.forEach(delType);

                if (value instanceof Error)
                    return test.ok(false, typeName + '['+encodedBuf+'] decode should fail');

                test.deepEqual(rez, value, typeName + '['+encodedBuf+'] decoded value correct');
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
