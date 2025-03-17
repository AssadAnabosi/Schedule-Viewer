"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import type {
  Schedule,
  ScheduleEvent,
  ScheduleSettings,
  CourseItem,
} from "@/types/schedule";
import CourseEditDialog from "@/components/course-edit-dialog";

interface WeeklyScheduleProps {
  schedule: Schedule;
  settings: ScheduleSettings;
  onUpdateCourse: (course: CourseItem) => void;
  onAddCourse: (course: CourseItem) => void;
  onDeleteCourse: (courseId: string) => void;
}

export function WeeklySchedule({
  schedule,
  settings,
  onUpdateCourse,
  onAddCourse,
  onDeleteCourse,
}: WeeklyScheduleProps) {
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const events = useMemo(() => {
    const allEvents: ScheduleEvent[] = [];
    schedule.items.forEach((course) => {
      course.meetingTimes.forEach((meeting) => {
        const days = [
          meeting.days.sunday,
          meeting.days.monday,
          meeting.days.tuesday,
          meeting.days.wednesday,
          meeting.days.thursday,
          meeting.days.friday,
          meeting.days.saturday,
        ];

        days.forEach((isActive, dayIndex) => {
          if (isActive) {
            const startTime = meeting.startHour + meeting.startMinute / 60;
            const endTime = meeting.endHour + meeting.endMinute / 60;

            allEvents.push({
              id: `${course.uid}-${meeting.uid}-${dayIndex}`,
              title: course.title,
              location: meeting.location,
              courseType: meeting.courseType,
              instructor: meeting.instructor,
              day: dayIndex,
              startTime,
              endTime,
              backgroundColor: course.backgroundColor,
            });
          }
        });
      });
    });
    return allEvents;
  }, [schedule]);

  const timeRange = useMemo(() => {
    let minTime = 24;
    let maxTime = 0;

    // if no events, default to 8am - 5pm
    if (events.length === 0) {
      minTime = 8;
      maxTime = 17;
    }

    events.forEach((event) => {
      minTime = Math.min(minTime, Math.floor(event.startTime));
      maxTime = Math.max(maxTime, Math.ceil(event.endTime));
    });

    // Ensure we have at least 8 hours displayed
    if (maxTime - minTime < 8) {
      maxTime = minTime + 8;
    }

    // Generate time slots - every 30 minutes or 1 hour based on settings
    const slots = [];
    if (settings.timeIncrement === "30m") {
      for (let hour = minTime; hour <= maxTime; hour++) {
        slots.push(hour);
        if (hour < maxTime) {
          slots.push(hour + 0.5);
        }
      }
    } else {
      // For 1h increment, ensure we're using whole hours
      const roundedMinTime = Math.floor(minTime);
      const roundedMaxTime = Math.ceil(maxTime);
      for (let hour = roundedMinTime; hour <= roundedMaxTime; hour++) {
        slots.push(hour);
      }
    }

    return {
      minTime,
      maxTime,
      slots,
    };
  }, [events, settings.timeIncrement]);

  const days = useMemo(() => {
    const weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    if (settings.startDay === "monday") {
      return [...weekDays.slice(1), weekDays[0]];
    }
    return weekDays;
  }, [settings.startDay]);

  const formatTime = (time: number) => {
    const hour = Math.floor(time);
    const minute = Math.round((time - hour) * 60);

    if (settings.clockType === "12h") {
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${hour12}:${minute.toString().padStart(2, "0")}${period}`;
    }

    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  const [eventHeights, setEventHeights] = useState<Record<string, number>>({});
  const eventRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [slotHeight, setSlotHeight] = useState<number>(60);

  useEffect(() => {
    const newHeights: Record<string, number> = {};
    const measureHeights = () => {
      Object.entries(eventRefs.current).forEach(([id, element]) => {
        if (element) newHeights[id] = element.scrollHeight;
      });
      setEventHeights(newHeights);
    };
    const timer = setTimeout(measureHeights, 100);
    return () => clearTimeout(timer);
  }, [events]);

  useEffect(() => {
    if (Object.keys(eventHeights).length === 0) return;
    let maxHeightPerSlot = 60;
    events.forEach((event) => {
      const contentHeight = eventHeights[event.id] || 0;
      if (contentHeight === 0) return;
      const durationSlots =
        (event.endTime - event.startTime) *
        (settings.timeIncrement === "30m" ? 2 : 1);
      const requiredSlotHeight = Math.ceil(contentHeight / durationSlots);
      maxHeightPerSlot = Math.max(maxHeightPerSlot, requiredSlotHeight);
    });
    setSlotHeight(maxHeightPerSlot);
  }, [eventHeights, events, settings.timeIncrement]);

  const gridHeight = useMemo(
    () => timeRange.slots.length * slotHeight,
    [slotHeight, timeRange.slots]
  );

  const handleCourseClick = (eventId: string) => {
    // Extract course UID from event ID (format: courseUid-meetingUid-dayIndex)
    const courseUid = eventId.split("-").slice(0, 5).join("-");
    const course = schedule.items.find((item) => item.uid === courseUid);

    if (course) {
      setSelectedCourse(course);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveCourse = (course: CourseItem) => {
    onUpdateCourse(course);
    setIsEditDialogOpen(false);
    setSelectedCourse(null);
  };

  const calculateEventPosition = (event: ScheduleEvent) => {
    const startTimeOffset = event.startTime - timeRange.minTime;
    let top, height;

    if (settings.timeIncrement === "30m") {
      const slotIndex = Math.floor(startTimeOffset * 2);
      const slotOffset = startTimeOffset * 2 - slotIndex;
      top = slotIndex * slotHeight + slotOffset * slotHeight;
      height = (event.endTime - event.startTime) * slotHeight * 2;
    } else {
      // For 1h increment
      top = startTimeOffset * slotHeight;
      height = (event.endTime - event.startTime) * slotHeight;
    }

    return { top, height };
  };

  return (
    <div className="flex flex-col" id="schedule-container">
      <div className="relative">
        <div className="sticky top-0 z-20 grid grid-cols-8">
          <div className="border-r bg-transparent p-2 text-center font-semibold"></div>
          {days.map((day) => (
            <div
              key={day}
              className="border-b border-r bg-background p-2 text-center font-semibold"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="relative" style={{ height: `${gridHeight}px` }}>
          {timeRange.slots.map((time, index) => (
            <div
              key={time}
              className="absolute left-0 grid w-full grid-cols-8 border-t"
              style={{
                top: `${index * slotHeight}px`,
                height: `${slotHeight}px`,
              }}
            >
              <div className="sticky left-0 z-10 -mt-2.5 border-r bg-background pr-2 text-right text-xs">
                {formatTime(time)}
              </div>
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-full border-r"></div>
              ))}
            </div>
          ))}

          {events.map((event) => {
            const { top, height } = calculateEventPosition(event);

            // Adjust day index based on settings.startDay
            const adjustedDayIndex =
              settings.startDay === "monday" ? (event.day + 6) % 7 : event.day;

            return (
              <div
                key={event.id}
                ref={(el) => {
                  eventRefs.current[event.id] = el;
                }}
                className="absolute cursor-pointer overflow-hidden rounded-md p-2 text-xs shadow-md transition-opacity hover:opacity-90"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  backgroundColor: event.backgroundColor,
                  left: `calc(${(adjustedDayIndex + 1) * (100 / 8)}% + 2px)`,
                  width: `calc(${100 / 8}% - 4px)`,
                  zIndex: 10,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCourseClick(event.id);
                }}
              >
                <div className="pointer-events-none absolute inset-0 rounded-md bg-black/30"></div>

                <div className="relative whitespace-normal break-words font-bold text-white">
                  {event.title}
                </div>

                {event.courseType && (
                  <div className="relative text-white">{event.courseType}</div>
                )}
                {event.instructor && (
                  <div className="relative text-white">{event.instructor}</div>
                )}

                <div className="relative mt-1 text-white">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>

                <div className="relative text-white">{event.location}</div>
              </div>
            );
          })}
        </div>

        <CourseEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          course={selectedCourse}
          onSave={handleSaveCourse}
          onDelete={onDeleteCourse}
          settings={settings}
        />
      </div>
    </div>
  );
}
