import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// eslint-disable-next-line @next/next/no-async-client-component
async function Home() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchPosts(1, 30);

  return (
    <div>
      <h1 className="head-text text-left text-primary-500">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {result.posts.map((item) => (
              <ThreadCard
                key={item._id}
                id={item._id}
                currentUserId={user?.id}
                parentId={item.parentId}
                content={item.text}
                author={item.author}
                community={item.community}
                createdAt={item.createdAt}
                comments={item.comments}
              />
            ))}
          </>
        )}
      </section>
    </div>
  );
}

export default Home;
