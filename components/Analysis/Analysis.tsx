"use client";
import React, { useState, ChangeEvent } from 'react';
import Head from 'next/head';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/ui/file-upload";
import Image from 'next/image';


interface EyeResult {
  predicted_class: number;
  stage: string;
  confidence: string;
  explanation: string;
  Note: string | null;
  Risk: string;
}

interface ApiResponse {
  left_image_result: EyeResult;
  right_image_result: EyeResult;
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
      {data.map((item) => (
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

const EyeAnalysisCard = ({ eye, data }: { eye: string; data: EyeResult }) => {
  const { stage, confidence, explanation, Risk, predicted_class } = data;
  const chartData: ChartDataItem[] = [
    {
      name: 'Risk',
      value: parseFloat(Risk.replace('%', '')),
      displayValue: Risk,
      markers: [
        { position: 33, label: 'Low' },
        { position: 66, label: 'Medium' },
        { position: 100, label: 'High' },
      ]
    },
    {
      name: 'Confidence',
      value: parseFloat(confidence.replace('%', '')),
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
      displayValue: stage,
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
        <CardDescription className="text-lg mt-3 font-medium">{stage}: {explanation}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <CustomBarChart data={chartData} />
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t p-4">
        <div className="text-sm font-medium mb-1">Note:</div>
        <div className="text-sm text-muted-foreground">{data.Note}</div>
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
  const handlePatientIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPatientId(e.target.value);
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

  const handleSubmit = async () => {
    if (!patientId || !leftEyeImage || !rightEyeImage) {
      setError('Please fill in all fields and upload both eye images.');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('left_image', leftEyeImage);
    formData.append('right_image', rightEyeImage);
  
    try {
      const response = await fetch('https://gnayan-huf2h0hjfxb3efg7.southindia-01.azurewebsites.net/predict/', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error response:', errorBody);
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
  
      const data: ApiResponse = await response.json();
      setApiData(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(`An error occurred while processing your request: ${error.message}`);
        console.error('Error:', error);
      } else {
        setError('An unknown error occurred');
        console.error('Unknown error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </Head>
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
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Left Eye Image</p>
                  <FileUpload
                    onChange={(files) => handleImageUpload(files, 'left')}
                  />
                  {leftEyePreview && (
                    <Image src={leftEyePreview} alt="Left Eye Preview" width={100} height={100} />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Right Eye Image</p>
                  <FileUpload
                    onChange={(files) => handleImageUpload(files, 'right')}
                  />
                  {rightEyePreview && (
                    <Image src={rightEyePreview} alt="Right Eye Preview" width={100} height={100} />
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Analyzing...' : 'Submit'}
                </Button>
                {error && <div className="text-red-500 mt-2">{error}</div>}
              </CardFooter>
            </Card>

            {apiData && (
              <div className="space-y-6">
                <EyeAnalysisCard eye="Left" data={apiData.left_image_result} />
                <EyeAnalysisCard eye="Right" data={apiData.right_image_result} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}