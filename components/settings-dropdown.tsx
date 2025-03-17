"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import type { ScheduleSettings } from "@/types/schedule";

interface SettingsDropdownProps {
  settings: ScheduleSettings;
  onSettingsChange: (settings: ScheduleSettings) => void;
}

export function SettingsDropdown({
  settings,
  onSettingsChange,
}: SettingsDropdownProps) {
  const [localSettings, setLocalSettings] =
    useState<ScheduleSettings>(settings);
  const { setTheme } = useTheme();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    setTheme(localSettings.theme);
  }, [localSettings.theme, setTheme]);

  const handleSettingChange = <K extends keyof ScheduleSettings>(
    key: K,
    value: ScheduleSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-4">
        <h3 className="mb-4 font-semibold">Settings</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">Clock Type</p>
            <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-md border">
              <button
                className={`px-2 py-1 text-sm ${
                  localSettings.clockType === "12h"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => handleSettingChange("clockType", "12h")}
              >
                12 Hour
              </button>
              <button
                className={`px-2 py-1 text-sm ${
                  localSettings.clockType === "24h"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => handleSettingChange("clockType", "24h")}
              >
                24 Hour
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm">First Day of Week</p>
            <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-md border">
              <button
                className={`px-2 py-1 text-sm ${
                  localSettings.startDay === "monday"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => handleSettingChange("startDay", "monday")}
              >
                Monday
              </button>
              <button
                className={`px-2 py-1 text-sm ${
                  localSettings.startDay === "sunday"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => handleSettingChange("startDay", "sunday")}
              >
                Sunday
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm">Time Increment</p>
            <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-md border">
              <button
                className={`px-2 py-1 text-sm ${
                  localSettings.timeIncrement === "30m"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => handleSettingChange("timeIncrement", "30m")}
              >
                30 Minutes
              </button>
              <button
                className={`px-2 py-1 text-sm ${
                  localSettings.timeIncrement === "1h"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => handleSettingChange("timeIncrement", "1h")}
              >
                1 Hour
              </button>
            </div>
          </div>

          <div className="space-y-2 border-t pt-2">
            <p className="text-sm">Theme</p>
            <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-md border">
              <button
                className={`px-2 py-1 text-sm ${
                  localSettings.theme === "light"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => handleSettingChange("theme", "light")}
              >
                Light
              </button>
              <button
                className={`px-2 py-1 text-sm ${
                  localSettings.theme === "dark"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => handleSettingChange("theme", "dark")}
              >
                Dark
              </button>
              <button
                className={`px-2 py-1 text-sm ${
                  localSettings.theme === "system"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => handleSettingChange("theme", "system")}
              >
                System
              </button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
