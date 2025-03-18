"use client";

import { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Trash2 } from "lucide-react";
import type {
  CourseItem,
  MeetingTime,
  ScheduleSettings,
} from "@/types/schedule";

interface CourseEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseItem | null;
  onSave: (course: CourseItem) => void;
  onDelete?: (courseId: string) => void;
  settings: ScheduleSettings;
}

function CourseEditDialog({
  open,
  onOpenChange,
  course,
  onSave,
  onDelete,
  settings,
}: CourseEditDialogProps) {
  const [editedCourse, setEditedCourse] = useState<CourseItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>("course");
  const [activeMeetingIndex, setActiveMeetingIndex] = useState(0);
  const [errors, setErrors] = useState<{
    title?: string;
    meetingTimes: Array<{
      days?: string;
      startTime?: string;
      endTime?: string;
      timeOrder?: string;
    }>;
  }>({
    meetingTimes: [],
  });
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Reorder days based on settings.startDay
  const orderedDays = useMemo(() => {
    const days = [
      { key: "sunday", label: "Sun" },
      { key: "monday", label: "Mon" },
      { key: "tuesday", label: "Tues" },
      { key: "wednesday", label: "Wed" },
      { key: "thursday", label: "Thurs" },
      { key: "friday", label: "Fri" },
      { key: "saturday", label: "Sat" },
    ];

    if (settings.startDay === "monday") {
      return [...days.slice(1), days[0]];
    }

    return days;
  }, [settings.startDay]);

  useEffect(() => {
    if (course) {
      setEditedCourse(JSON.parse(JSON.stringify(course))); // Deep clone
      setActiveTab("course");
    } else {
      // Create a new course with default values
      setEditedCourse({
        uid: uuidv4(),
        type: "Course",
        title: "",
        backgroundColor: getRandomColor(),
        meetingTimes: [createDefaultMeetingTime()],
      });
    }

    // Reset errors when dialog opens
    setErrors({ meetingTimes: [] });
  }, [course, open]);

  const createDefaultMeetingTime = (): MeetingTime => ({
    uid: uuidv4(),
    courseType: "",
    instructor: "",
    location: "",
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    days: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  });

  const getRandomColor = () => {
    const colors = [
      "#FFE37D", // Yellow
      "#C8F7C5", // Green
      "#E08283", // Red
      "#99CCCC", // Blue
      "#CC99CC", // Purple
      "#FFCC99", // Orange
      "#99CCFF", // Light Blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleTitleChange = (value: string) => {
    if (!editedCourse) return;
    setEditedCourse({ ...editedCourse, title: value });

    // Clear error if value is provided
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  const handleColorChange = (value: string) => {
    if (!editedCourse) return;
    setEditedCourse({ ...editedCourse, backgroundColor: value });
  };

  const handleMeetingTimeChange = (
    index: number,
    field: keyof MeetingTime,
    value: any
  ) => {
    if (!editedCourse) return;

    const updatedMeetingTimes = [...editedCourse.meetingTimes];

    if (field === "days") {
      updatedMeetingTimes[index] = {
        ...updatedMeetingTimes[index],
        days: { ...updatedMeetingTimes[index].days, ...value },
      };

      // Clear days error if at least one day is selected
      const hasSelectedDay = Object.values({
        ...updatedMeetingTimes[index].days,
        ...value,
      }).some((day) => day);
      if (hasSelectedDay) {
        setErrors((prev) => {
          const updatedMeetingErrors = [...prev.meetingTimes];
          if (!updatedMeetingErrors[index]) updatedMeetingErrors[index] = {};
          updatedMeetingErrors[index].days = undefined;
          return { ...prev, meetingTimes: updatedMeetingErrors };
        });
      }
    } else {
      updatedMeetingTimes[index] = {
        ...updatedMeetingTimes[index],
        [field]: value,
      };

      // Clear time errors if values are provided
      if (
        (field === "startHour" || field === "startMinute") &&
        value !== null
      ) {
        setErrors((prev) => {
          const updatedMeetingErrors = [...prev.meetingTimes];
          if (!updatedMeetingErrors[index]) updatedMeetingErrors[index] = {};
          updatedMeetingErrors[index].startTime = undefined;

          // Check time order after updating start time
          const startTime =
            field === "startHour"
              ? value * 60 + updatedMeetingTimes[index].startMinute
              : updatedMeetingTimes[index].startHour * 60 + value;

          const endTime =
            updatedMeetingTimes[index].endHour * 60 +
            updatedMeetingTimes[index].endMinute;

          if (startTime >= endTime) {
            updatedMeetingErrors[index].timeOrder =
              "End time must be after start time.";
          } else {
            updatedMeetingErrors[index].timeOrder = undefined;
          }

          return { ...prev, meetingTimes: updatedMeetingErrors };
        });
      }

      if ((field === "endHour" || field === "endMinute") && value !== null) {
        setErrors((prev) => {
          const updatedMeetingErrors = [...prev.meetingTimes];
          if (!updatedMeetingErrors[index]) updatedMeetingErrors[index] = {};
          updatedMeetingErrors[index].endTime = undefined;

          // Check time order after updating end time
          const startTime =
            updatedMeetingTimes[index].startHour * 60 +
            updatedMeetingTimes[index].startMinute;
          const endTime =
            field === "endHour"
              ? value * 60 + updatedMeetingTimes[index].endMinute
              : updatedMeetingTimes[index].endHour * 60 + value;

          if (startTime >= endTime) {
            updatedMeetingErrors[index].timeOrder =
              "End time must be after start time.";
          } else {
            updatedMeetingErrors[index].timeOrder = undefined;
          }

          return { ...prev, meetingTimes: updatedMeetingErrors };
        });
      }
    }

    setEditedCourse({ ...editedCourse, meetingTimes: updatedMeetingTimes });
  };

  const handleAddMeetingTime = () => {
    if (!editedCourse) return;

    const newMeetingTime = createDefaultMeetingTime();
    setEditedCourse({
      ...editedCourse,
      meetingTimes: [...editedCourse.meetingTimes, newMeetingTime],
    });

    // Add empty error object for the new meeting time
    setErrors((prev) => ({
      ...prev,
      meetingTimes: [...prev.meetingTimes, {}],
    }));

    // Switch to the new meeting time
    setActiveMeetingIndex(editedCourse.meetingTimes.length);
  };

  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      meetingTimes: Array<{
        days?: string;
        startTime?: string;
        endTime?: string;
        timeOrder?: string;
      }>;
    } = {
      meetingTimes: [],
    };

    let isValid = true;

    // Validate title
    if (!editedCourse?.title.trim()) {
      newErrors.title = "Course title is required.";
      isValid = false;
    }

    // Validate meeting times
    editedCourse?.meetingTimes.forEach((meeting, index) => {
      newErrors.meetingTimes[index] = {};

      // Check if at least one day is selected
      const hasSelectedDay = Object.values(meeting.days).some((day) => day);
      if (!hasSelectedDay) {
        newErrors.meetingTimes[index].days =
          "At least one day must be selected.";
        isValid = false;
      }

      // Validate start time
      if (meeting.startHour === null || meeting.startMinute === null) {
        newErrors.meetingTimes[index].startTime = "Start time is required.";
        isValid = false;
      }

      // Validate end time
      if (meeting.endHour === null || meeting.endMinute === null) {
        newErrors.meetingTimes[index].endTime = "End time is required.";
        isValid = false;
      }

      // Validate time order
      if (
        meeting.startHour !== null &&
        meeting.startMinute !== null &&
        meeting.endHour !== null &&
        meeting.endMinute !== null
      ) {
        const startTime = meeting.startHour * 60 + meeting.startMinute;
        const endTime = meeting.endHour * 60 + meeting.endMinute;

        if (startTime >= endTime) {
          newErrors.meetingTimes[index].timeOrder =
            "End time must be after start time.";
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (editedCourse && validateForm()) {
      onSave(editedCourse);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (editedCourse && onDelete) {
      onDelete(editedCourse.uid);
      onOpenChange(false);
    }
  };

  // Format time for display in the meeting time header
  const formatTimeHeader = (meeting: MeetingTime) => {
    const formatTimeSegment = (hour: number, minute: number) => {
      return `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
    };

    return `${formatTimeSegment(
      meeting.startHour,
      meeting.startMinute
    )} - ${formatTimeSegment(meeting.endHour, meeting.endMinute)}`;
  };

  // Add a delete button for meeting times
  // In the component, add a new function to handle meeting time deletion
  const handleDeleteMeetingTime = (index: number) => {
    if (!editedCourse || editedCourse.meetingTimes.length <= 1) return;

    const updatedMeetingTimes = [...editedCourse.meetingTimes];
    updatedMeetingTimes.splice(index, 1);

    setEditedCourse({
      ...editedCourse,
      meetingTimes: updatedMeetingTimes,
    });

    // Update errors array
    setErrors((prev) => {
      const updatedMeetingErrors = [...prev.meetingTimes];
      updatedMeetingErrors.splice(index, 1);
      return { ...prev, meetingTimes: updatedMeetingErrors };
    });

    // If we're deleting the active meeting time, switch to the first one
    if (activeMeetingIndex >= updatedMeetingTimes.length) {
      setActiveMeetingIndex(Math.max(0, updatedMeetingTimes.length - 1));
    }
  };

  if (!editedCourse) return null;

  const content = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="course">Course</TabsTrigger>
        <TabsTrigger value="event">Event</TabsTrigger>
      </TabsList>

      <TabsContent value="course" className="mt-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course-title">Course Title</Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="course-title"
                value={editedCourse.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={errors.title ? "border-red-500" : ""}
                placeholder="Required"
              />
              {errors.title && (
                <p className="text-xs text-red-500">• {errors.title} </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course-color">Color</Label>
            <div className="col-span-3 flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded border"
                style={{ backgroundColor: editedCourse.backgroundColor }}
              >
                <div className="flex h-full w-full items-center justify-center bg-black/30">
                  <span className="text-xs text-white">
                    {editedCourse.backgroundColor.substring(1, 2)}
                  </span>
                </div>
              </div>
              <Input
                id="course-color"
                className="text-md"
                type="text"
                value={editedCourse.backgroundColor}
                onChange={(e) => handleColorChange(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-t-md bg-muted p-2">
            <div className="flex items-center justify-between font-medium text-muted-foreground">
              <div>
                Meeting Time {activeMeetingIndex + 1}
                {editedCourse.meetingTimes[activeMeetingIndex] && (
                  <span className="ml-2 text-sm">
                    {formatTimeHeader(
                      editedCourse.meetingTimes[activeMeetingIndex]
                    )}
                  </span>
                )}
              </div>
              {editedCourse.meetingTimes.length > 1 && (
                <button
                  onClick={() => handleDeleteMeetingTime(activeMeetingIndex)}
                  className="transition-colors hover:text-red-200"
                  type="button"
                  aria-label="Delete meeting time"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-b-md p-4">
            <div className="mb-4 grid grid-cols-7 gap-2">
              {orderedDays.map((day) => (
                <div key={day.key} className="flex flex-col items-center">
                  <span className="text-xs"> {day.label} </span>
                  <Checkbox
                    checked={
                      editedCourse.meetingTimes[activeMeetingIndex].days[
                        day.key as keyof MeetingTime["days"]
                      ]
                    }
                    onCheckedChange={(checked) =>
                      handleMeetingTimeChange(activeMeetingIndex, "days", {
                        [day.key]: !!checked,
                      })
                    }
                  />
                </div>
              ))}
            </div>

            {errors.meetingTimes[activeMeetingIndex]?.days && (
              <p className="text-xs text-red-500">
                • {errors.meetingTimes[activeMeetingIndex].days}{" "}
              </p>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-time">Start Time</Label>
              <div className="col-span-3 space-y-1">
                <div className="flex items-center">
                  <Input
                    id="start-hour"
                    type="number"
                    min="0"
                    max="23"
                    value={
                      editedCourse.meetingTimes[activeMeetingIndex].startHour
                    }
                    onChange={(e) =>
                      handleMeetingTimeChange(
                        activeMeetingIndex,
                        "startHour",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className={`text-md w-16 ${
                      errors.meetingTimes[activeMeetingIndex]?.startTime
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <span className="mx-1">: </span>
                  <Input
                    id="start-minute"
                    type="number"
                    min="0"
                    max="59"
                    value={
                      editedCourse.meetingTimes[activeMeetingIndex].startMinute
                    }
                    onChange={(e) =>
                      handleMeetingTimeChange(
                        activeMeetingIndex,
                        "startMinute",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className={`text-md w-16 ${
                      errors.meetingTimes[activeMeetingIndex]?.startTime
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {errors.meetingTimes[activeMeetingIndex]?.startTime && (
                  <p className="text-xs text-red-500">
                    • {errors.meetingTimes[activeMeetingIndex].startTime}{" "}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {" "}
                  Enter time in 24 - hour format(00 - 23){" "}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-time">End Time</Label>
              <div className="col-span-3 space-y-1">
                <div className="flex items-center">
                  <Input
                    id="end-hour"
                    type="number"
                    min="0"
                    max="23"
                    value={
                      editedCourse.meetingTimes[activeMeetingIndex].endHour
                    }
                    onChange={(e) =>
                      handleMeetingTimeChange(
                        activeMeetingIndex,
                        "endHour",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className={`text-md w-16 ${
                      errors.meetingTimes[activeMeetingIndex]?.endTime
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <span className="mx-1">: </span>
                  <Input
                    id="end-minute"
                    type="number"
                    min="0"
                    max="59"
                    value={
                      editedCourse.meetingTimes[activeMeetingIndex].endMinute
                    }
                    onChange={(e) =>
                      handleMeetingTimeChange(
                        activeMeetingIndex,
                        "endMinute",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className={`text-md w-16 ${
                      errors.meetingTimes[activeMeetingIndex]?.endTime
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {errors.meetingTimes[activeMeetingIndex]?.endTime && (
                  <p className="text-xs text-red-500">
                    • {errors.meetingTimes[activeMeetingIndex].endTime}{" "}
                  </p>
                )}
                {errors.meetingTimes[activeMeetingIndex]?.timeOrder && (
                  <p className="text-xs text-red-500">
                    • {errors.meetingTimes[activeMeetingIndex].timeOrder}{" "}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="course-type">Course Type</Label>
              <Input
                id="course-type"
                placeholder="Optional (ex. Lab)"
                value={editedCourse.meetingTimes[activeMeetingIndex].courseType}
                onChange={(e) =>
                  handleMeetingTimeChange(
                    activeMeetingIndex,
                    "courseType",
                    e.target.value
                  )
                }
                className="text-md col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                placeholder="Optional"
                value={editedCourse.meetingTimes[activeMeetingIndex].instructor}
                onChange={(e) =>
                  handleMeetingTimeChange(
                    activeMeetingIndex,
                    "instructor",
                    e.target.value
                  )
                }
                className="text-md col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Optional"
                value={editedCourse.meetingTimes[activeMeetingIndex].location}
                onChange={(e) =>
                  handleMeetingTimeChange(
                    activeMeetingIndex,
                    "location",
                    e.target.value
                  )
                }
                className="text-md col-span-3"
              />
            </div>
          </div>

          {editedCourse.meetingTimes.length > 1 && (
            <div className="mt-2 flex justify-center gap-2">
              {editedCourse.meetingTimes.map((_, index) => (
                <Button
                  key={index}
                  variant={activeMeetingIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveMeetingIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddMeetingTime}
          >
            Add Another Meeting Time
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="event" className="mt-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-name">Event Name</Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="event-name"
                value={editedCourse.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={errors.title ? "border-red-500" : ""}
                placeholder="Required"
              />
              {errors.title && (
                <p className="text-xs text-red-500">• {errors.title} </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-color">Color</Label>
            <div className="col-span-3 flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded border"
                style={{ backgroundColor: editedCourse.backgroundColor }}
              >
                <div className="flex h-full w-full items-center justify-center bg-black/30">
                  <span className="text-xs text-white">
                    {editedCourse.backgroundColor.substring(1, 2)}
                  </span>
                </div>
              </div>
              <Input
                id="event-color"
                type="text"
                className="text-md"
                value={editedCourse.backgroundColor}
                onChange={(e) => handleColorChange(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-t-md bg-muted p-2">
            <div className="flex items-center justify-between font-medium text-muted-foreground">
              <div>
                Meeting Time {activeMeetingIndex + 1}
                {editedCourse.meetingTimes[activeMeetingIndex] && (
                  <span className="ml-2 text-sm">
                    {formatTimeHeader(
                      editedCourse.meetingTimes[activeMeetingIndex]
                    )}
                  </span>
                )}
              </div>
              {editedCourse.meetingTimes.length > 1 && (
                <button
                  onClick={() => handleDeleteMeetingTime(activeMeetingIndex)}
                  className="transition-colors hover:text-red-200"
                  type="button"
                  aria-label="Delete meeting time"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-b-md p-4">
            <div className="mb-4 grid grid-cols-7 gap-2">
              {orderedDays.map((day) => (
                <div key={day.key} className="flex flex-col items-center">
                  <span className="text-xs"> {day.label} </span>
                  <Checkbox
                    checked={
                      editedCourse.meetingTimes[activeMeetingIndex].days[
                        day.key as keyof MeetingTime["days"]
                      ]
                    }
                    onCheckedChange={(checked) =>
                      handleMeetingTimeChange(activeMeetingIndex, "days", {
                        [day.key]: !!checked,
                      })
                    }
                  />
                </div>
              ))}
            </div>

            {errors.meetingTimes[activeMeetingIndex]?.days && (
              <p className="text-xs text-red-500">
                • {errors.meetingTimes[activeMeetingIndex].days}{" "}
              </p>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-start-time">Start Time</Label>
              <div className="col-span-3 space-y-1">
                <div className="flex items-center">
                  <Input
                    id="event-start-hour"
                    type="number"
                    min="0"
                    max="23"
                    value={
                      editedCourse.meetingTimes[activeMeetingIndex].startHour
                    }
                    onChange={(e) =>
                      handleMeetingTimeChange(
                        activeMeetingIndex,
                        "startHour",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className={`text-md w-16 ${
                      errors.meetingTimes[activeMeetingIndex]?.startTime
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <span className="mx-1">: </span>
                  <Input
                    id="event-start-minute"
                    type="number"
                    min="0"
                    max="59"
                    value={
                      editedCourse.meetingTimes[activeMeetingIndex].startMinute
                    }
                    onChange={(e) =>
                      handleMeetingTimeChange(
                        activeMeetingIndex,
                        "startMinute",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className={`text-md w-16 ${
                      errors.meetingTimes[activeMeetingIndex]?.startTime
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {errors.meetingTimes[activeMeetingIndex]?.startTime && (
                  <p className="text-xs text-red-500">
                    • {errors.meetingTimes[activeMeetingIndex].startTime}{" "}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {" "}
                  Enter time in 24 - hour format(00 - 23){" "}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-end-time">End Time</Label>
              <div className="col-span-3 space-y-1">
                <div className="flex items-center">
                  <Input
                    id="event-end-hour"
                    type="number"
                    min="0"
                    max="23"
                    value={
                      editedCourse.meetingTimes[activeMeetingIndex].endHour
                    }
                    onChange={(e) =>
                      handleMeetingTimeChange(
                        activeMeetingIndex,
                        "endHour",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className={`text-md w-16 ${
                      errors.meetingTimes[activeMeetingIndex]?.endTime
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <span className="mx-1">: </span>
                  <Input
                    id="event-end-minute"
                    type="number"
                    min="0"
                    max="59"
                    value={
                      editedCourse.meetingTimes[activeMeetingIndex].endMinute
                    }
                    onChange={(e) =>
                      handleMeetingTimeChange(
                        activeMeetingIndex,
                        "endMinute",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className={`text-md w-16 ${
                      errors.meetingTimes[activeMeetingIndex]?.endTime
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {errors.meetingTimes[activeMeetingIndex]?.endTime && (
                  <p className="text-xs text-red-500">
                    • {errors.meetingTimes[activeMeetingIndex].endTime}{" "}
                  </p>
                )}
                {errors.meetingTimes[activeMeetingIndex]?.timeOrder && (
                  <p className="text-xs text-red-500">
                    • {errors.meetingTimes[activeMeetingIndex].timeOrder}{" "}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                placeholder="Optional"
                value={editedCourse.meetingTimes[activeMeetingIndex].location}
                onChange={(e) =>
                  handleMeetingTimeChange(
                    activeMeetingIndex,
                    "location",
                    e.target.value
                  )
                }
                className="text-md col-span-3"
              />
            </div>
          </div>

          {editedCourse.meetingTimes.length > 1 && (
            <div className="mt-2 flex justify-center gap-2">
              {editedCourse.meetingTimes.map((_, index) => (
                <Button
                  key={index}
                  variant={activeMeetingIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveMeetingIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddMeetingTime}
          >
            Add Another Event Time
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
  const footer = (
    <>
      {course && onDelete && (
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="m-0 md:mr-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete {activeTab === "course" ? "Course" : "Event"}
        </Button>
      )}
      <Button onClick={handleSave}>
        {course
          ? `Edit ${activeTab === "course" ? "Course" : "Event"}`
          : `Add ${activeTab === "course" ? "Course" : "Event"}`}
      </Button>
    </>
  );
  return isDesktop ? (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Item" : "Add Item"} </DialogTitle>
        </DialogHeader>
        {content}
        <DialogFooter className="flex justify-between">{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="pt-6">
          <DrawerTitle>{course ? "Edit Item" : "Add Item"}</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="overflow-y-auto">
          {content}
          <DrawerFooter>{footer}</DrawerFooter>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

export default CourseEditDialog;
