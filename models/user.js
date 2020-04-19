const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const UserSchema=new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true,
    },
    resetPasswordToken: {
        type: String,
        required: false,
    },
    resetPasswordExpires: {
        type: Date,
        required: false,
    },
    isVerified:{
        type:Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        required: false,
    },
    },{
    timestamps: true
});

// Encrypt password
UserSchema.pre("save", async function() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  
});

// Match user password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User=mongoose.model('User',UserSchema);

module.exports=User;