"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";

type DeviceSize = "mobile" | "tablet" | "desktop";

export function PreviewPanel() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceSize, setDeviceSize] = useState<DeviceSize>("desktop");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getDeviceDimensions = () => {
    switch (deviceSize) {
      case "mobile":
        return { width: "375px", height: "667px" };
      case "tablet":
        return { width: "768px", height: "1024px" };
      default:
        return { width: "100%", height: "100%" };
    }
  };

  const dimensions = getDeviceDimensions();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Preview</span>
          <div className="flex items-center gap-1">
            <Button
              variant={deviceSize === "mobile" ? "default" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setDeviceSize("mobile")}
              title="Mobile (375x667)"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceSize === "tablet" ? "default" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setDeviceSize("tablet")}
              title="Tablet (768x1024)"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceSize === "desktop" ? "default" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setDeviceSize("desktop")}
              title="Desktop (Full)"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center bg-muted/30 p-4 overflow-auto">
        <div
          className="bg-background border rounded-lg shadow-lg transition-all duration-300"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <iframe
            className="w-full h-full rounded-lg"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
            srcDoc={`
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Preview</title>
                <style>
                  body {
                    font-family: system-ui, -apple-system, sans-serif;
                    padding: 2rem;
                    margin: 0;
                  }
                  .container {
                    max-width: 800px;
                    margin: 0 auto;
                  }
                  h1 { color: #333; }
                  p { line-height: 1.6; color: #666; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>🚀 ZacAi IDE Preview</h1>
                  <p>Your code preview will appear here.</p>
                  <p><strong>Phase 4:</strong> Live code execution with WebAssembly</p>
                  <ul>
                    <li>Real-time updates</li>
                    <li>Error boundaries</li>
                    <li>Hot module reload</li>
                    <li>Console output capture</li>
                  </ul>
                </div>
              </body>
              </html>
            `}
          />
        </div>
      </div>

      <div className="p-2 border-t">
        <p className="text-xs text-muted-foreground">
          Phase 4: Live preview with WebAssembly execution
        </p>
      </div>
    </div>
  );
}
