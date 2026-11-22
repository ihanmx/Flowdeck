"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../types";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/cn";

export function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes, //add accessibility attributes like role and aria-describedby
    listeners, //pointer or keys that start the drag
    setNodeRef, //dom element
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }} // slide the card out of the way when another card is dragged past it. CSS.Translate moves it without the scaling CSS.Transform would apply, which distorts cards of different heights.
      {...attributes}
      {...listeners}
      className={cn("cursor-grab touch-none", isDragging && "opacity-40")} // while dragging: the original card stays in place as a faded placeholder, and the floating copy follows your curso
      //touch-none is needed for drag to work on touch screens. Otherwise the browser treats the finger movement as scrolling.
    >
      <TaskCard task={task} />
    </div>
  );
}
