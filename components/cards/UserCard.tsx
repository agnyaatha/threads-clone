"use client";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface UserCardProps {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  personType: string;
}

function UserCard(user: UserCardProps) {
  const router = useRouter();
  return (
    <article className="user-card">
      <div className="user-card_avatar">
        <Image
          src={user.imageUrl}
          alt="logo"
          width={48}
          height={48}
          className="rounded-full"
        />

        <div className="flex-1 text-ellipsis">
          <h4 className="text-base-semibold text-light-1">{user.name}</h4>
          <p className="text-small-medium text-gray-1">{user.username}</p>
        </div>
      </div>
      <Button
        className="bg-primary-500 hover:border-2 hover:border-white"
        onClick={() => router.push(`/profile/${user.id}`)}
      >
        View
      </Button>
    </article>
  );
}

export default UserCard;
