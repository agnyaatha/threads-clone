import mongoose from "mongoose";

// id: A unique identifier for the user. This field is required and must be a string.
// username: The user's username. This field is required and must be unique.
// image: The user's profile image. This field is optional.
// bio: The user's bio. This field is optional.
// threads: An array of references to the threads that the user has created.
// onboarded: A boolean flag that indicates whether the user has completed the onboarding process.
// communities: An array of references to the communities that the user is a member of.

const userSchema = new mongoose.Schema({
    id: {type: String, required: true},
    username: {type: String, unique: true, required : true},
    image: String,
    bio: String,
    threads: [{type:mongoose.Schema.Types.ObjectId, ref:"Thread"},],
    onboarded: {type:Boolean, default:false},
    communities: [{type:mongoose.Schema.Types.ObjectId, ref:"Community",},],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;