import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  leftEyePreview: string;
  rightEyePreview: string;
  onSubmitFeedback: (feedback: FeedbackData) => void;
  patientId: string;
  leftEyeData: EyeData;
  rightEyeData: EyeData;
}

interface EyeData {
  predicted_class: number;
  Stage: string;
  confidence: number;
  explanation: string;
  Note: string;
  Risk_Factor: number;
}

interface FeedbackData {
  patient_id: string;
  email_id: string;
  left_eye: EyeFeedback;
  right_eye: EyeFeedback;
}

interface EyeFeedback {
  predicted_class: number;
  Stage: string;
  confidence: number;
  explanation: string;
  Note: string;
  Risk_Factor: number;
  feedback: string;
  doctors_diagnosis: string;
  review: string;
}

const diagnosisOptions = ['No DR', 'Mild', 'Moderate', 'Proliferative'];

export function FeedbackModal({ 
  isOpen, 
  onClose, 
  leftEyePreview, 
  rightEyePreview, 
  onSubmitFeedback,
  patientId,
  leftEyeData,
  rightEyeData
}: FeedbackModalProps) {
  const [leftEyeReview, setLeftEyeReview] = useState<'positive' | 'negative' | null>(null);
  const [rightEyeReview, setRightEyeReview] = useState<'positive' | 'negative' | null>(null);
  const [leftEyeDiagnosis, setLeftEyeDiagnosis] = useState('');
  const [rightEyeDiagnosis, setRightEyeDiagnosis] = useState('');
  const [leftEyeFeedback, setLeftEyeFeedback] = useState('');
  const [rightEyeFeedback, setRightEyeFeedback] = useState('');

  const handleSubmit = () => {
    const feedbackData: FeedbackData = {
      patient_id: patientId,
      email_id: "xxyy_hospital@gmail.com", // Static for now
      left_eye: {
        ...leftEyeData,
        feedback: leftEyeFeedback,
        doctors_diagnosis: leftEyeDiagnosis,
        review: leftEyeReview || ''
      },
      right_eye: {
        ...rightEyeData,
        feedback: rightEyeFeedback,
        doctors_diagnosis: rightEyeDiagnosis,
        review: rightEyeReview || ''
      }
    };
    onSubmitFeedback(feedbackData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#112240] text-white max-w-5xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Provide Feedback</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-gray-600 pb-2">Left Eye</h3>
            <div className="relative w-[150px] h-[150px] mx-auto mb-4">
              <Image 
                src={leftEyePreview} 
                alt="Left Eye" 
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex justify-center space-x-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeftEyeReview('positive')}
                className={`${
                  leftEyeReview === 'positive' 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'text-white border-gray-400 hover:bg-green-600/20'
                }`}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Positive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeftEyeReview('negative')}
                className={`${
                  leftEyeReview === 'negative' 
                    ? 'bg-red-600 text-white border-red-600' 
                    : 'text-white border-gray-400 hover:bg-red-600/20'
                }`}
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Negative
              </Button>
            </div>
            <RadioGroup value={leftEyeDiagnosis} onValueChange={setLeftEyeDiagnosis} className="flex justify-between mb-4 bg-[#1A2C4E] p-4 rounded-lg">
              {diagnosisOptions.map((option) => (
                <div key={option} className="flex items-center">
                  <RadioGroupItem value={option} id={`left-${option}`} className="border-white data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                  <Label htmlFor={`left-${option}`} className="ml-2 text-white">{option}</Label>
                </div>
              ))}
            </RadioGroup>
            <Textarea
              placeholder="Enter feedback for left eye"
              value={leftEyeFeedback}
              onChange={(e) => setLeftEyeFeedback(e.target.value)}
              className="w-full bg-[#1A2C4E] text-white border-gray-600 focus:border-indigo-500 placeholder:text-gray-400"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-gray-600 pb-2">Right Eye</h3>
            <div className="relative w-[150px] h-[150px] mx-auto mb-4">
              <Image 
                src={rightEyePreview} 
                alt="Right Eye" 
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex justify-center space-x-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRightEyeReview('positive')}
                className={`${
                  rightEyeReview === 'positive' 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'text-white border-gray-400 hover:bg-green-600/20'
                }`}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Positive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRightEyeReview('negative')}
                className={`${
                  rightEyeReview === 'negative' 
                    ? 'bg-red-600 text-white border-red-600' 
                    : 'text-white border-gray-400 hover:bg-red-600/20'
                }`}
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Negative
              </Button>
            </div>
            <RadioGroup value={rightEyeDiagnosis} onValueChange={setRightEyeDiagnosis} className="flex justify-between mb-4 bg-[#1A2C4E] p-4 rounded-lg">
              {diagnosisOptions.map((option) => (
                <div key={option} className="flex items-center">
                  <RadioGroupItem value={option} id={`right-${option}`} className="border-white data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                  <Label htmlFor={`right-${option}`} className="ml-2 text-white">{option}</Label>
                </div>
              ))}
            </RadioGroup>
            <Textarea
              placeholder="Enter feedback for right eye"
              value={rightEyeFeedback}
              onChange={(e) => setRightEyeFeedback(e.target.value)}
              className="w-full bg-[#1A2C4E] text-white border-gray-600 focus:border-indigo-500 placeholder:text-gray-400"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white">Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

