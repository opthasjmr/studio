"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSignature } from "lucide-react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function PatientConsentPage() {
  const router = useRouter();

  // Placeholder submit handler
  const handleConsentSubmit = async () => {
    // Logic to submit consent
    // On success:
    // await updateUserCondition(userId, 'consentSigned', true); // Update cookie/state
    router.push("/dashboard");
  };

  return (
    <div className="container mx-auto py-10 px-4 flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <FileSignature className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-bold">Patient Consent</CardTitle>
          <CardDescription className="text-md">
            Please review and sign the consent form to proceed with our services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Placeholder for consent form content */}
          <div className="h-64 overflow-y-auto p-4 border rounded-md bg-secondary/30 text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Terms and Conditions for Telemedicine and Data Usage:</p>
            <p>1. I consent to receive medical consultations via telemedicine services provided by Vision Care Plus.</p>
            <p>2. I understand that my medical information, including diagnostic images and EMR, will be stored securely and used for treatment purposes.</p>
            <p>3. I acknowledge that AI-assisted diagnostic tools may be used to support clinical decision-making, and the final diagnosis and treatment plan will be determined by a qualified medical professional.</p>
            <p>4. I agree to the clinic's privacy policy and terms of service...</p>
            <p className="mt-4">[...Full consent form text would go here...]</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="consent-checkbox" />
            <Label htmlFor="consent-checkbox" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I have read and agree to the terms and conditions.
            </Label>
          </div>
          
          <Button onClick={handleConsentSubmit} className="w-full" disabled>
            Agree and Continue (Disabled)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
