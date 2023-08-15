"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB  } from "../mongoose";

interface ThreadProps{
    text: string,
    author: string,
    communityId: string | null,
    path: string
}

async function createThread(thread : ThreadProps){
    try {
        connectToDB();

        const createThread = await Thread.create({text : thread.text, author: thread.author, community: null});

        // Update User model
        // The $push operator is used to add a new element to an array, and the createThread._id variable refers to the ID of the newly created thread.
        await User.findByIdAndUpdate(thread.author, {
            $push: {threads: createThread._id},
        });

        revalidatePath(thread.path);

    } catch (error : any) {
        throw new Error(`Failed to create the thread: ${error.message}`)
    }
}

async function fetchPosts(pageNumber =1, pageSize =20){
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize ;

 // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
 const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
 .sort({ createdAt: "desc" })
 .skip(skipAmount)
 .limit(pageSize)
 .populate({
   path: "author",
   model: User,
 })
//  .populate({
//    path: "community",
//    model: Community,
//  })
 .populate({
   path: "children", // Populate the children field
   populate: {
     path: "author", // Populate the author field within children
     model: User,
     select: "_id name parentId image", // Select only _id and username fields of the author
   },
 });

// Count the total number of top-level posts (threads) i.e., threads that are not comments.
const totalPostsCount = await Thread.countDocuments({
 parentId: { $in: [null, undefined] },
}); // Get the total count of posts

const posts = await postsQuery.exec();

const isNext = totalPostsCount > skipAmount + posts.length;

return { posts, isNext };
}

async function fetchThreadById(id:string) {
  try {
    connectToDB();

    const thread = await Thread.findById(id)
    .populate({
      path:'author',
      model:User,
      select:"_id id name image"
    })
    .populate({
      path:'children',
      populate: [
        {
          path: "author",
          model: User,
          select: "_id id name parentId image"
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path:"author",
            model: User,
            select: "_id id name parentId image"
          }
        }
      ]
    }).exec();

    return thread;
  } catch (error : any) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

async function addCommentToThread(threadId:string, commentText:string, userId:string, path:string){
  try {
    connectToDB();

    const originalThread = await Thread.findById(threadId);

    if(!originalThread){
      throw new Error("Thread not found");
    }

    const commentThread = new Thread({
      text: commentText, author: userId, parentId: threadId
    });

    const savedCommmentThread = await commentThread.save();

    originalThread.children.push(savedCommmentThread._id);

    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Cannot add comment: ${error.message}`)
  }
}

export {createThread, fetchPosts, fetchThreadById, addCommentToThread};