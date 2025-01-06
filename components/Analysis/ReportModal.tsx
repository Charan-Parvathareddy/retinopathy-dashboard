"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Report } from "./Report";
import { usePDF } from 'react-to-pdf';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: "email" | "whatsapp"; value: string }) => Promise<void>;
  patientId: string;
  leftEyeImage: string | null;
  rightEyeImage: string | null;
  leftEyeData: EyeData | undefined;
  rightEyeData: EyeData | undefined;
}

interface EyeData {
  predicted_class: number;
  Stage: string;
  confidence: number;
  explanation: string;
  Note: string;
  Risk_Factor: number;
}

export function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  patientId,
  leftEyeImage,
  rightEyeImage,
  leftEyeData,
  rightEyeData,
}: ReportModalProps) {
  const { toPDF, targetRef } = usePDF({filename: `G-Nayana-PatientID-${patientId}-Report.pdf`});

  // Check if we have all the necessary data to render the report
  const canRenderReport = leftEyeImage && rightEyeImage && leftEyeData && rightEyeData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#112240] text-white max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Preview</DialogTitle>
        </DialogHeader>
        {canRenderReport ? (
          <div ref={targetRef}>
            <Report
              patientId={patientId}
              leftEyeImage={leftEyeImage}
              rightEyeImage={rightEyeImage}
              leftEyeData={leftEyeData}
              rightEyeData={rightEyeData}
            />
          </div>
        ) : (
          <p>Unable to generate report. Some required data is missing.</p>
        )}
        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="mr-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            Close
          </Button>
          {canRenderReport && (
            <Button onClick={() => toPDF()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Download Report
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

