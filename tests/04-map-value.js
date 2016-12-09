/**
 * Created by encobrain on 07.12.16.
 */

var detpack = require('../index'),

    mapSchema = detpack.compiler.compileFileSync(__dirname+'/schemas/map.detpack'),

    User = mapSchema.User,
    UserDefaults = mapSchema.UserDefaults,
    UserOpts = mapSchema.UserOpts,

    entities = [
        [User, {}, new Error()],
        [User, {name: 'foo'}, new Error()],
        [User, {age: 10}, new Error()],
        [User, {items: ['book','pen']}, new Error()],
        [User, {name:'foo', age:10, items:['book','pen']},
            [0x00,0x83,0x66,0x6f,0x6f,0x8a,0x82,0x84,0x62,0x6f,0x6f,0x6b,0x83,0x70,0x65,0x6e]],

        [UserDefaults, {},
            [0x01,0x00],
            {name: 'Unnamed', age: 100500, items:['phone', 'tablet']}],
        [UserDefaults, {name: 'foo'},
            [0x01,0x80,0x83,0x66,0x6f,0x6f],
            {name: 'foo', age: 100500, items:['phone', 'tablet']}],
        [UserDefaults, {age: 10},
            [0x01,0x40,0x8a],
            {name: 'Unnamed', age: 10, items:['phone', 'tablet']}],
        [UserDefaults, {items: ['book','pen']},
            [0x01,0x20,0x82,0x84,0x62,0x6f,0x6f,0x6b,0x83,0x70,0x65,0x6e],
            {name: 'Unnamed', age: 100500, items:['book', 'pen']}],
        [UserDefaults, {name:'foo', age:10, items:['book','pen']},
            [0x01,0xe0,0x83,0x66,0x6f,0x6f,0x8a,0x82,0x84,0x62,0x6f,0x6f,0x6b,0x83,0x70,0x65,0x6e]],

        [UserOpts, {name:'LongName', age: 10, items: ['book','pen']}, new Error()],
        [UserOpts, {name:'foo', age: 100500, items: ['book','pen']}, new Error()],
        [UserOpts, {name:'foo', age: 10, items: ['longItemName','pen']}, new Error()],
        [UserOpts, {name:'foo', age: 10, items: ['book']}, new Error()],
        [UserOpts, {name:'foo', age: 10, items: ['book','pen']},
            [0x02,0x83,0x66,0x6f,0x6f,0x8a,0x82,0x84,0x62,0x6f,0x6f,0x6b,0x83,0x70,0x65,0x6e]],
        [UserOpts, new Error(), [0x02,0x87,0x66,0x6f,0x6f,0x8a,0x82,0x84,0x62,0x6f,0x6f,0x6b,0x83,0x70,0x65,0x6e]],
        [UserOpts, new Error(), [0x02,0x83,0x66,0x6f,0x6f,0x89,0x82,0x84,0x62,0x6f,0x6f,0x6b,0x83,0x70,0x65,0x6e]],
        [UserOpts, new Error(), [0x02,0x83,0x66,0x6f,0x6f,0x8a,0x81,0x84,0x62,0x6f,0x6f,0x6b,0x83,0x70,0x65,0x6e]],
        [UserOpts, new Error(), [0x02,0x83,0x66,0x6f,0x6f,0x8a,0x82,0x87,0x62,0x6f,0x6f,0x6b,0x83,0x70,0x65,0x6e]]
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

                delete rez.__type__;

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
