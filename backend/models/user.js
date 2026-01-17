import { timeStamp } from "console";
import mongoose from "mongoose";

const UserSchema= new mongoose.Schema({
userName:{
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    default: "gallegopys1987",
},
passwordHash:{
    type: String,
    required: true,
},
name: {
    type: String,
    required: true,
    default: "Pedro",
},
role: {
    type: String,
    enum: ["admin"],
    default: "admin"
}
},{timestamps: true});

export default mongoose.model('User', UserSchema);