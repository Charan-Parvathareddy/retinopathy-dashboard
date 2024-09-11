"use client";
import React, { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileUpload } from "@/components/ui/file-upload";

interface PatientFormData {
  patient_id: string;
  name: string;
}

interface ApiResponse {
  patient_id: string;
  right_eye_result: {
    predicted_class: number;
    Stage: string;
    confidence: string;
    explanation: string;
    warning: string | null;
    Risk_Factor: string;
  };
  left_eye_result: {
    predicted_class: number;
    Stage: string;
    confidence: string;
    explanation: string;
    warning: string | null;
    Risk_Factor: string;
  };
}

interface ChartDataItem {
  name: string;
  value: number;
  displayValue: string;
  markers?: { position: number; label: string }[];
  isConfidence?: boolean;
  isPredictionClass?: boolean;
}

const getColorForValue = (value: number, isConfidence: boolean, isPredictionClass: boolean): string => {
  if (isConfidence) {
    if (value <= 33) return 'hsl(var(--chart-2))'; // Red
    if (value <= 66) return 'hsl(var(--chart-4))'; // Yellow
    return 'hsl(var(--chart-1))'; // Green
  } else if (isPredictionClass) {
    if (value === 0) return 'hsl(var(--chart-1))'; // Green
    if (value === 1) return 'hsl(var(--chart-4))'; // Yellow
    return 'hsl(var(--chart-2))'; // Red
  } else {
    if (value <= 33) return 'hsl(var(--chart-1))'; // Green
    if (value <= 66) return 'hsl(var(--chart-4))'; // Yellow
    return 'hsl(var(--chart-2))'; // Red
  }
};

const CustomBarChart = ({ data }: { data: ChartDataItem[] }) => {
  return (
    <div className="space-y-6">
      {data.map((item, index) => (
        <div key={item.name} className="relative">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{item.name}</span>
            <span className="text-sm font-bold text-gray-900">{item.displayValue}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-5 dark:bg-gray-700">
            <div
              className="h-5 rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${item.isPredictionClass ? ((item.value + 1) / 3) * 100 : item.value}%`,
                backgroundColor: getColorForValue(item.value, item.isConfidence || false, item.isPredictionClass || false),
              }}
            />
          </div>
          {item.markers && (
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {item.markers.map((marker, idx) => (
                <div key={idx} className="text-center" style={{ width: '33.33%' }}>
                  {marker.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const EyeAnalysisCard = ({ eye, data }: { eye: string; data: ApiResponse['right_eye_result'] | ApiResponse['left_eye_result'] }) => {
  const { Stage, confidence, explanation, Risk_Factor, predicted_class } = data;
  const chartData: ChartDataItem[] = [
    {
      name: 'Risk',
      value: parseFloat(Risk_Factor),
      displayValue: Risk_Factor,
      markers: [
        { position: 33, label: 'Low' },
        { position: 66, label: 'Medium' },
        { position: 100, label: 'High' },
      ]
    },
    {
      name: 'Confidence',
      value: parseFloat(confidence),
      displayValue: confidence,
      markers: [
        { position: 33, label: 'Low' },
        { position: 66, label: 'Medium' },
        { position: 100, label: 'High' },
      ],
      isConfidence: true
    },
    {
      name: 'Prediction Class',
      value: predicted_class,
      displayValue: Stage,
      markers: [
        { position: 33, label: 'No DR' },
        { position: 66, label: 'Moderate' },
        { position: 100, label: 'Severe' },
      ],
      isPredictionClass: true
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold mb-2">{eye} Eye Analysis</CardTitle>
        <Separator className="my-3" />
        <CardDescription className="text-lg mt-3 font-medium">{Stage}: {explanation}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <CustomBarChart data={chartData} />
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t p-4">
        <div className="text-sm font-medium mb-1">Note:</div>
        <div className="text-sm text-muted-foreground">{data.warning}</div>
      </CardFooter>
    </Card>
  );
};

export function Analysis() {
  const [patientId, setPatientId] = useState<string>('');
  const [leftEyeImage, setLeftEyeImage] = useState<File | null>(null);
  const [rightEyeImage, setRightEyeImage] = useState<File | null>(null);
  const [leftEyePreview, setLeftEyePreview] = useState<string | null>(null);
  const [rightEyePreview, setRightEyePreview] = useState<string | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PatientFormData>({
    patient_id: '',
    name: '',
  });

  const handlePatientIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPatientId(e.target.value);
    setFormData(prev => ({ ...prev, patient_id: e.target.value }));
  };

  const handleImageUpload = (files: File[], eye: 'left' | 'right') => {
    if (files.length > 0) {
      const file = files[0];
      if (eye === 'left') {
        setLeftEyeImage(file);
        setLeftEyePreview(URL.createObjectURL(file));
      } else {
        setRightEyeImage(file);
        setRightEyePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!patientId || !leftEyeImage || !rightEyeImage) {
      setError('Please fill in all fields and upload both eye images.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('left_eye', leftEyeImage);
    formData.append('right_eye', rightEyeImage);

    try {
      const response = await fetch('http://4.213.205.254:8000/docs/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ApiResponse = await response.json();
      setApiData(data);
    } catch (err) {
      setError('An error occurred while processing your request. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm z-50">
        <h1 className="text-2xl font-bold">Diabetic Retinopathy Analysis</h1>
      </header>
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Patient ID"
                value={patientId}
                onChange={handlePatientIdChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Left Eye Image</label>
                  {leftEyePreview ? (
                    <div className="relative">
                      <img src={leftEyePreview} alt="Left Eye Preview" className="w-full h-auto rounded-lg" />
                    </div>
                  ) : (
                    <FileUpload onChange={(files) => handleImageUpload(files, 'left')} />
                  )}
                </div>
                <div>
                  <label className="block mb-2 font-medium">Right Eye Image</label>
                  {rightEyePreview ? (
                    <div className="relative">
                      <img src={rightEyePreview} alt="Right Eye Preview" className="w-full h-auto rounded-lg" />
                    </div>
                  ) : (
                    <FileUpload onChange={(files) => handleImageUpload(files, 'right')} />
                  )}
                </div>
              </div>
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                {isLoading ? 'Processing...' : 'Analyze'}
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Card className="mb-8 bg-red-50 border-red-200">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {apiData && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EyeAnalysisCard eye="Left" data={apiData.left_eye_result} />
                  <EyeAnalysisCard eye="Right" data={apiData.right_eye_result} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
