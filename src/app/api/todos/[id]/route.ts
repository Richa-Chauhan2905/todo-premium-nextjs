import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = (await auth()).userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const todoId = params.id;

    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 401 });
    }

    if (todo.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 401 });
    }

    await prisma.todo.delete({
      where: { id: todoId },
    });

    return NextResponse.json(
      { message: "Todo deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting todo", err);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const userId = (await auth()).userId;

  if (!userId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const todoId = req.nextUrl.pathname.split("/").pop();

    const { completed } = await req.json();

    if (!completed) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const existingTodo = await prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });

    if (!existingTodo) {
      return NextResponse.json(
        {
          error: "Todo not found!",
        },
        { status: 404 }
      );
    }

    if (existingTodo.userId !== userId) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        { status: 403 }
      );
    }

    const updatedTodo = await prisma.todo.update({
      where: {
        id: todoId,
      },
      data: {
        completed,
      },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error("Error fetching todos", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
