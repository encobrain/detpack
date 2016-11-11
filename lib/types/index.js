/**
 * Created by Encobrain on 31.10.16.
 */

module.exports = {
    Int: require('./int').Type,
    Int8: require('./int8').Type,
    Int16: require('./int16').Type,
    Int32: require('./int32').Type,
    Int64: require('./int64').Type,

    I8: require('./int8').Type,
    I16: require('./int16').Type,
    I32: require('./int32').Type,
    I64: require('./int64').Type,

    Uint: require('./uint').Type,
    Uint8: require('./uint8').Type,
    Uint16: require('./uint16').Type,
    Uint32: require('./uint32').Type,
    Uint64: require('./uint64').Type,

    U8: require('./uint8').Type,
    U16: require('./uint16').Type,
    U32: require('./uint32').Type,
    U64: require('./uint64').Type,

    Float16: require('./float16').Type,
    Float32: require('./float32').Type,
    Float64: require('./float64').Type,
    Float128: require('./float128').Type,

    F16: require('./float16').Type,
    F32: require('./float32').Type,
    F64: require('./float64').Type,
    F128: require('./float128').Type,

    Half: require('./float16').Type,
    Float: require('./float32').Type,
    Double: require('./float64').Type,
    Quad: require('./float128').Type,

    Num: require('./num').Type,

    Utf8: require('./utf8').Type,
    Bool: require('./bool').Type,
    Bin: require('./bin').Type
};
