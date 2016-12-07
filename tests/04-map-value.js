/**
 * Created by encobrain on 07.12.16.
 */

var detpack = require('../index'),

    simple = detpack.compiler.compileFileSync(__dirname+'/schemas/map.detpack'),

    user = new simple.User(),
    userDefaults = new simple.UserDefaults(),

    entities = [
        [user, {}, new Error()],
        [user, {name: 'foo'}, new Error()],
        [user, {age: 10}, new Error()],
        [user, {items: ['book','pen']}, new Error()],
        [user, {name:'foo', age:10, items:['book','pen']},
            [0x83,0x66,0x6f,0x6f,0x8a,0x82,0x84,0x62,0x6f,0x6f,0x6b,0x83,0x70,0x65,0x6e]],

        [userDefaults, {},
            [0x00],
            {name: 'Unnamed', age: 100500, items:['phone', 'tablet']}],
        [userDefaults, {name: 'foo'},
            [0x80,0x83,0x66,0x6f,0x6f],
            {name: 'foo', age: 100500, items:['phone', 'tablet']}],
        [userDefaults, {age: 10},
            [0x40,0x8a],
            {name: 'Unnamed', age: 10, items:['phone', 'tablet']}],
        [userDefaults, {items: ['book','pen']},
            [0x20,0x82,0x84,0x62,0x6f,0x6f,0x6b,0x83,0x70,0x65,0x6e],
            {name: 'Unnamed', age: 100500, items:['book', 'pen']}],
        [userDefaults, {name:'foo', age:10, items:['book','pen']},
            [0xe0,0x83,0x66,0x6f,0x6f,0x8a,0x82,0x84,0x62,0x6f,0x6f,0x6b,0x83,0x70,0x65,0x6e]],

    ]
    ;



module.exports = {
    'Encode': function (test) {

        function encode (entity) {
            var type = entity[0],
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
            var type = entity[0],
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
