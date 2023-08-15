"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface UserProps{
    userId: string;
    username: string;
    name: string;
    bio:string;
    image:string;
    path:string
};

export async function fetchUser(userId : string){
    try {
        connectToDB() ;

        return await User.findOne({id:userId})
        // .populate({
        //     path: "communities", 
        //     model: Community,
        // });
    } catch (error : any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

export async function updateUser(user : UserProps): Promise<void> {
   try {
    connectToDB();

    await User.findOneAndUpdate(
        {id : user.userId},
        {username: user.username.toLowerCase(), name: user.name, bio: user.bio, image: user.image, onboarded: true},
        {upsert : true}
    )

// This function allows you to revalidate data associated with a specific path. This is useful for scenarios where you want to update your cached data without waiting for a revalidation period to expire.
// The revalidatePath function takes two arguments:
// path: The path of the resource that you want to revalidate.
// delay: The delay in milliseconds before the revalidation will occur. If you set the delay to 0, the revalidation will occur immediately.
    if(user.path === "/profile/edit"){
        revalidatePath(user.path);
    }
   } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
   }
}

export async function fetchUserPosts(userId : string){
    try {
        connectToDB();

        const threads = await User.findOne({id: userId})
        .populate({
            path: 'threads',
            model: Thread,
            populate: {
                path:'children',
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: "name image id"
                }
            }
        });

        return threads;
    } catch (error: any) {
        throw new Error(`Failed to fetch posts : ${error.message}`)
    }
}

export async function fetchUsers({userId, searchString="", pageNumber = 1, pageSize=20, sortBy = "desc"} :
{userId: string, searchString?: string, pageNumber? : number, pageSize?: number, sortBy?: SortOrder}){
    try {
        connectToDB();

        const skipAmount = (pageNumber -1 ) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof User> = {
            id : { $ne: userId}
        }

        if(searchString.trim() !== ''){
            query.$or = [
                {username: {$regex: regex}},
                {name: {$regex: regex}}
            ]
        }

        const sortOptions = { createdAt: sortBy};

        const userQuery = User.find(query).sort(sortOptions)
        .skip(skipAmount).limit(pageSize);

        const totalUsersCount = await User.countDocuments(query);

        const users = await userQuery.exec();

        const isNext = totalUsersCount > skipAmount + userId.length;

        return {users, isNext};

    } catch (error:any) {
        throw new Error(`Failed to fetch users list: ${error.message}`)
    }
}

export async function getActivity(userId: string){
    try {
        connectToDB();

        // Find all threads created by the user
        const userThreads = await Thread.find({author : userId});

         // Collect all the child thread ids (replies) from the 'children' field of each user thread
        const childThreadIds = userThreads.reduce((acc, userThreads) => {
            return acc.concat(userThreads.children)
        }, [])

         // Find and return the child threads (replies) excluding the ones created by the same user
        const replies = await Thread.find({
            _id: {$in: childThreadIds},
            author: {$ne: userId} // Exclude threads authored by the same user
        }).populate({
            path:'author',
            model:User,
            select: 'name image _id'
        })

        return replies;
        
    } catch (error : any) {
        throw new Error(`Failed to fetch activity: ${error.message}`)
    }
}

