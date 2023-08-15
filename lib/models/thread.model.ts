import mongoose from "mongoose";

// text: The text of the thread. This field is required, so every thread must have some text.
// author: The ID of the user who created the thread. This field is also required, so every thread must have a creator.
// community: The ID of the community the thread belongs to. This field is not required, so a thread can exist without being associated with a community.
// createdAt: The date and time the thread was created. This field is automatically set to the current date and time when the thread is created.
// parentId: The ID of the parent thread, if any. This field is optional, and can be used to indicate that the thread is a reply to another thread.
// children: An array of IDs of child threads, if any. This field is optional, and can be used to store a list of child threads.
// The code block also uses the mongoose.Schema.Types.ObjectId type for the author and community fields. This type indicates that the field should store an ObjectId, which is a unique identifier for a MongoDB document. The ref keyword is used to specify that the author and community fields should reference other schemas, in this case the User and Community schemas.
const threadSchema = new mongoose.Schema({
    text: {type:String, required : true},
    author: {type:mongoose.Schema.Types.ObjectId, ref:"User", required : true},
    community: {type:mongoose.Schema.Types.ObjectId, ref:"Community",},
    createdAt: {type:Date, default: Date.now},
    parentId: {type:String},
    children: [{type:mongoose.Schema.Types.ObjectId, ref:"Thread"},],
})

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;