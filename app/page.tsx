"use client";

import { useState, useEffect } from "react";
import { WeeklySchedule } from "@/components/weekly-schedule";
import { ScheduleHeader } from "@/components/schedule-header";
import type {
  ScheduleData,
  ScheduleSettings,
  CourseItem,
} from "@/types/schedule";
import { ScheduleLogistics } from "@/components/schedule-logistics";

// Default empty schedule
const defaultScheduleData: ScheduleData = {
  lastSaved: undefined,
  schedule: {
    title: "My Schedule",
    items: [],
  },
};

// Default settings
const defaultSettings: ScheduleSettings = {
  startDay: "sunday",
  clockType: "24h",
  timeIncrement: "30m",
  theme: "light",
};

export default function Home() {
  const [scheduleData, setScheduleData] =
    useState<ScheduleData>(defaultScheduleData);
  const [settings, setSettings] = useState<ScheduleSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedSchedule = localStorage.getItem("scheduleData");
    const savedSettings = localStorage.getItem("scheduleSettings");

    if (savedSchedule) {
      try {
        setScheduleData(JSON.parse(savedSchedule));
      } catch (error) {
        console.error("Failed to parse saved schedule:", error);
      }
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
    localStorage.setItem("scheduleSettings", JSON.stringify(settings));
  }, [scheduleData, settings, isLoaded]);

  const handleScheduleLoad = (data: ScheduleData) => {
    const updatedData = {
      ...data,
      lastSaved: new Date().toISOString(),
    };
    setScheduleData(updatedData);
  };

  const handleTitleChange = (newTitle: string) => {
    setScheduleData({
      ...scheduleData,
      lastSaved: new Date().toISOString(),
      schedule: {
        ...scheduleData.schedule,
        title: newTitle,
      },
    });
  };

  const handleSettingsChange = (newSettings: ScheduleSettings) => {
    setSettings(newSettings);
  };

  const handleUpdateCourse = (updatedCourse: CourseItem) => {
    const updatedItems = scheduleData.schedule.items.map((item) =>
      item.uid === updatedCourse.uid ? updatedCourse : item
    );

    setScheduleData({
      ...scheduleData,
      lastSaved: new Date().toISOString(),
      schedule: {
        ...scheduleData.schedule,
        items: updatedItems,
      },
    });
  };

  const handleAddCourse = (newCourse: CourseItem) => {
    setScheduleData({
      ...scheduleData,
      lastSaved: new Date().toISOString(),
      schedule: {
        ...scheduleData.schedule,
        items: [...scheduleData.schedule.items, newCourse],
      },
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    const updatedItems = scheduleData.schedule.items.filter(
      (item) => item.uid !== courseId
    );

    setScheduleData({
      ...scheduleData,
      lastSaved: new Date().toISOString(),
      schedule: {
        ...scheduleData.schedule,
        items: updatedItems,
      },
    });
  };

  return (
    <main className="container mx-auto p-4">
      <ScheduleHeader
        title={scheduleData.schedule.title}
        currentUsedColors={scheduleData.schedule.items.map(
          (item) => item.backgroundColor
        )}
        onTitleChange={handleTitleChange}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onAddCourse={handleAddCourse}
      />

      <div className="mb-4">
        {scheduleData.lastSaved && (
          <p className="text-xs text-muted-foreground">
            Last Saved: {new Date(scheduleData.lastSaved).toLocaleString()}
          </p>
        )}
      </div>

      <ScheduleLogistics
        title={scheduleData.schedule.title}
        onScheduleLoad={handleScheduleLoad}
        scheduleData={scheduleData}
      />

      <div className="max-h-[80vh] overflow-auto rounded-lg border bg-background shadow-lg">
        <WeeklySchedule
          schedule={scheduleData.schedule}
          settings={settings}
          onUpdateCourse={handleUpdateCourse}
          onAddCourse={handleAddCourse}
          onDeleteCourse={handleDeleteCourse}
        />
      </div>
    </main>
  );
}
