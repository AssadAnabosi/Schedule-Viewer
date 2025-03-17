"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, ImageDown } from "lucide-react";
import type { ScheduleData } from "@/types/schedule";
import html2canvas from "html2canvas";

interface ScheduleLogisticsProps {
  title: string;
  onScheduleLoad: (data: ScheduleData) => void;
  scheduleData: ScheduleData;
}

export function ScheduleLogistics({
  title,
  onScheduleLoad,
  scheduleData,
}: ScheduleLogisticsProps) {
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        onScheduleLoad(jsonData);
      } catch (err) {
        setError("Invalid JSON file. Please upload a valid schedule file.");
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    setIsExporting(true);
    // Create a blob with the schedule data
    const dataStr = JSON.stringify(scheduleData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${scheduleData.schedule.title.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  const handleExportToPng = async () => {
    try {
      setIsExporting(true);

      // Get the original schedule container
      const originalElement = document.querySelector(
        "#schedule-container"
      ) as HTMLElement;
      if (!originalElement) {
        console.error("Schedule container not found");
        return;
      }

      // Get the background color from the --background CSS variable
      const backgroundColorHSL = getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim();

      // Function to convert HSL to RGB
      const hslToRgb = (h: number, s: number, l: number) => {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r: number, g: number, b: number;
        if (h < 60) {
          r = c;
          g = x;
          b = 0;
        } else if (h < 120) {
          r = x;
          g = c;
          b = 0;
        } else if (h < 180) {
          r = 0;
          g = c;
          b = x;
        } else if (h < 240) {
          r = 0;
          g = x;
          b = c;
        } else if (h < 300) {
          r = x;
          g = 0;
          b = c;
        } else {
          r = c;
          g = 0;
          b = x;
        }
        return `rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`;
      };

      console.log(backgroundColorHSL);
      const hslMatch = backgroundColorHSL.match(/^(\d+)\s+(\d+)%\s+([\d.]+)%$/);
      if (!hslMatch) {
        console.error("Invalid HSL format");
        return;
      }

      const h = parseInt(hslMatch[1], 10);
      const s = parseInt(hslMatch[2], 10);
      const l = parseInt(hslMatch[3], 10);

      // Convert to RGB
      const backgroundColorRGB = hslToRgb(h, s, l);

      // Create the h1 element
      const h1 = document.createElement("h1");
      h1.id = "schedule-title";
      h1.innerText = title;
      h1.classList.add("mx-auto", "text-2xl", "font-bold", "mb-5");

      originalElement.insertBefore(h1, originalElement.firstChild);

      // Use html2canvas to render the element to a canvas
      const canvas = await html2canvas(originalElement, {
        backgroundColor: backgroundColorRGB, // Set background color from the RGB value
        logging: true, // Enable logging for debugging
        scale: 2, // Scale factor for higher quality image
        useCORS: true, // Use CORS to load external resources (images, fonts)
      });

      // Get the data URL from the canvas (PNG format)
      const dataUrl = canvas.toDataURL("image/png");

      // Create a download link for the PNG image
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "_")}_schedule.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exporting schedule to PNG:", error);
    } finally {
      // Remove the h1 element after exporting
      const h1 = document.querySelector("#schedule-title");
      if (h1) h1.remove();

      setIsExporting(false);
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Schedule{" "}
          <span className="text-xs text-muted-foreground">json</span>
        </Button>
        <input
          id="file-upload"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Schedule
          <span className="text-xs text-muted-foreground">json</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleExportToPng}
          disabled={isExporting}
          title="Export as PNG"
        >
          <ImageDown className="h-4 w-4" />
          Download
          <span className="text-xs text-muted-foreground">png</span>
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
