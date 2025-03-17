"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { SettingsDropdown } from "@/components/settings-dropdown";
import CourseEditDialog from "@/components/course-edit-dialog";
import type { ScheduleSettings, CourseItem } from "@/types/schedule";

interface ScheduleHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  settings: ScheduleSettings;
  onSettingsChange: (settings: ScheduleSettings) => void;
  onAddCourse: (course: CourseItem) => void;
}

export function ScheduleHeader({
  title,
  onTitleChange,
  settings,
  onSettingsChange,
  onAddCourse,
}: ScheduleHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleTitleClick = () => {
    setEditedTitle(title);
    setIsEditing(true);
  };

  const handleTitleSave = () => {
    onTitleChange(editedTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedTitle(title);
    }
  };

  const handleAddCourse = (course: CourseItem) => {
    onAddCourse(course);
    setIsAddCourseOpen(false);
  };

  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className="max-w-xs"
            />
            <Button size="sm" onClick={handleTitleSave}>
              Save
            </Button>
          </div>
        ) : (
          <h1
            className="cursor-pointer text-2xl font-bold hover:underline"
            onClick={handleTitleClick}
          >
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsAddCourseOpen(true)}
          title="Add Item"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <SettingsDropdown
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      </div>

      <CourseEditDialog
        open={isAddCourseOpen}
        onOpenChange={setIsAddCourseOpen}
        course={null}
        onSave={handleAddCourse}
        settings={settings}
      />
    </div>
  );
}
