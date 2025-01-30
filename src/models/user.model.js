import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,//
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, //cloudinary url
        required: true
    },
    coverImage: {
        type: String //cloudinary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']   
    },
    refreshToken: {
        type: String
    }
}, 
{
    timestamps: true
}) 


//pre hook (here, we do not use aroow function as they don't have this->) execute before save event
/*
Now the problem is this pre hook will modify password on every update.
We want only when password is given to update
*/ 
userSchema.pre("save", async function (next) {
    if(!this.isModified("password"))   //to check any field is modified or not 
        return next();

    this.password = await bcrypt.hash(this.password, 11)
    next()
})

//Defining custom methods and injecting methods in our schema.
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    //jwt is bearer token(it is like a key)
    return jwt.sign(
        {//this is block is payload
            _id: this._id,//from mongodb
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    ) 
}

userSchema.methods.generateRefreshToken = function(){
    //both are same but usage is different
    return jwt.sign({
        _id: this._id,//from mongodb
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    ) 
}


export const User = mongoose.model("User", userSchema)