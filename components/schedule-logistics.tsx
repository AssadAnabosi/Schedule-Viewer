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
    let clonedElement: HTMLElement | null = null;
    try {
      setIsExporting(true);

      const originalElement = document.querySelector(
        "#schedule-container"
      ) as HTMLElement;
      if (!originalElement) {
        console.error("Schedule container not found");
        return;
      }

      // Clone the original element
      clonedElement = originalElement.cloneNode(true) as HTMLElement;
      clonedElement.style.width = "1600px"; // Set a fixed width for export
      clonedElement.style.left = "-9999px"; // Move it out of the viewport

      document.body.appendChild(clonedElement); // Add to the DOM temporarily

      // Ensure fonts don't resize
      document.body.style.zoom = "1";
      document.documentElement.style.fontSize = "16px";

      // Get the background color
      const backgroundColorHSL = getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim();

      const hslMatch = backgroundColorHSL.match(/^(\d+)\s+(\d+)%\s+([\d.]+)%$/);
      if (!hslMatch) {
        console.error("Invalid HSL format");
        return;
      }

      const h = parseInt(hslMatch[1], 10);
      const s = parseInt(hslMatch[2], 10);
      const l = parseInt(hslMatch[3], 10);

      const hslToRgb = (h: number, s: number, l: number) => {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let [r, g, b] =
          h < 60
            ? [c, x, 0]
            : h < 120
              ? [x, c, 0]
              : h < 180
                ? [0, c, x]
                : h < 240
                  ? [0, x, c]
                  : h < 300
                    ? [x, 0, c]
                    : [c, 0, x];
        return `rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`;
      };

      const backgroundColorRGB = hslToRgb(h, s, l);

      // Add title
      const h1 = document.createElement("h1");
      h1.innerText = title;
      h1.classList.add("mx-auto", "text-2xl", "font-bold", "mb-5");
      clonedElement.insertBefore(h1, clonedElement.firstChild);

      // Capture the element
      const canvas = await html2canvas(clonedElement, {
        backgroundColor: backgroundColorRGB,
        scale: window.devicePixelRatio > 1 ? 3 : 2, // Scale for higher quality
        width: 1600, // Force fixed width
        useCORS: true,
      });

      document.body.removeChild(clonedElement);

      // Download as PNG
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "_")}_schedule.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exporting schedule to PNG:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex flex-col items-start gap-2 md:flex-row">
        <Button
          variant="outline"
          className="flex w-full justify-start gap-2 md:w-fit"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          <span>Import Schedule </span>
          <span className="text-xs text-muted-foreground">json</span>
        </Button>
        <input
          id="file-upload"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button
          variant="outline"
          className="flex w-full justify-start gap-2 md:w-fit"
          onClick={handleExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Schedule
          <span className="text-xs text-muted-foreground">json</span>
        </Button>
        <Button
          variant="outline"
          className="flex w-full justify-start gap-2 md:w-fit"
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
