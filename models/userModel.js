const Role = require('./roleModel');
const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    is_verified: {
        type: Boolean,
        default: false
    }
    ,
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles',
        required: true,
        validate: {
            validator: async function (v) {
                const role = await Role.findById(v);
                return role != null;
            },
            message: 'This Role not Exist',
        },
    }
})

const userSchema = mongoose.model('User', usersSchema);


module.exports = userSchema;