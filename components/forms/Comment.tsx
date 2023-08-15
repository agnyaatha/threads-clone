"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CommentValidation } from "@/lib/validations/thread";
import { addCommentToThread, createThread } from "@/lib/actions/thread.actions";
import Image from "next/image";

interface CommentProps {
  threadId: string;
  currentUserImage: string;
  currentUserId: string;
}

function Comment(comment: CommentProps) {
  const router = useRouter();
  const pathName = usePathname();
  console.log(comment.currentUserImage);

  const form = useForm<z.infer<typeof CommentValidation>>({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    await addCommentToThread(
      comment.threadId,
      values.thread,
      JSON.parse(comment.currentUserId),
      pathName
    );

    form.reset();
  };

  return (
    <div>
      <h1 className="text-white">Comments...</h1>
      <Form {...form}>
        <form className="comment-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className="flex w-full items-center gap-3">
                <FormLabel className="text-base-semibold text-light-2 px-2">
                  <Image
                    src={comment.currentUserImage}
                    alt="current_user"
                    width={48}
                    height={48}
                    className="rounded-full object cover"
                  />
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter comment..."
                    className="account-form_input rounded-lg focus:border-1 focus:border-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="comment-form_btn border-2 border-transparent hover:border-2 hover:border-white mt-2"
            type="submit"
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Comment;
