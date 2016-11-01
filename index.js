/**
 * Created by Encobrain on 01.11.16.
 */


module.exports = {
    compiler: require('./lib/copiler'),
    parser: require('./lib/parser'),
    base: require('./lib/base'),
    types: require('./lib/types'),
    map: require('./lib/types/map'),
    oneof: require('./lib/types/oneof')
};