import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`
    )) as string;
    if (!idToAdd) {
      return new Response("This person does not exist", { status: 400 });
    }
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unautorized", { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response("You can not add yourself as your friend", {
        status: 400,
      });
    }

    // friend request has already been sent

    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Friend request sent already", { status: 400 });
    }
    // user is already added as a friend
    const isAlreadyFriend = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriend) {
      return new Response("This person is already your friend", {
        status: 400,
      });
    }

    // valid request, send the friend request
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);
    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
};
