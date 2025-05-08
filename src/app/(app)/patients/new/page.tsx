
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, UserPlus, CalendarIcon, Tag, Pill, History, PlusCircle, Trash2, Eye } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

const treatmentHistorySchema = z.object({
  date: z.date({ required_error: "Treatment date is required."}),
  treatment: z.string().min(1, "Treatment description is required."),
  notes: z.string().optional(),
});

const patientFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  dob: z.date({ required_error: "Date of birth is required." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  address: z.string().optional(),
  tags: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  medicalHistory: z.string().optional(), // General medical history
  ocularHistory: z.string().optional(), // Specific eye history
  currentMedications: z.string().optional(), // Comma-separated string
  treatmentHistory: z.array(treatmentHistorySchema).optional(),
});

export default function NewPatientPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof patientFormSchema>>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      tags: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      insuranceProvider: "",
      insurancePolicyNumber: "",
      medicalHistory: "",
      ocularHistory: "",
      currentMedications: "",
      treatmentHistory: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "treatmentHistory",
  });

  async function onSubmit(values: z.infer<typeof patientFormSchema>) {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to add a patient.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const tagsArray = values.tags 
        ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') 
        : [];
      
      const medicationsArray = values.currentMedications
        ? values.currentMedications.split(',').map(med => med.trim()).filter(med => med !== '')
        : [];
        
      const formattedTreatmentHistory = values.treatmentHistory?.map(item => ({
        ...item,
        date: item.date.toISOString().split('T')[0],
      }));

      await addDoc(collection(db, "patients"), {
        ...values,
        tags: tagsArray,
        currentMedications: medicationsArray,
        treatmentHistory: formattedTreatmentHistory,
        dob: values.dob.toISOString().split('T')[0], 
        userId: user.uid, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Patient Added",
        description: `${values.name} has been successfully added to the records.`,
      });
      router.push("/patients");
    } catch (error: any) {
      toast({
        title: "Error Adding Patient",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UserPlus className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Add New Patient</CardTitle>
              <CardDescription className="text-md">
                Enter the patient's details to create a new record.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <h3 className="text-xl font-semibold text-primary pt-4 border-t">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="e.g., (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="patient@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="123 Main St, Anytown, USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
               <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Tag className="mr-2 h-4 w-4" />
                      Patient Tags
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Glaucoma, High Risk, Follow-up Needed" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter tags separated by commas. These help categorize and find patients.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <h3 className="text-xl font-semibold text-primary pt-2">Medical Information</h3>
               <FormField
                control={form.control}
                name="ocularHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Eye className="mr-2 h-4 w-4" />Ocular History</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Previous eye surgeries, chronic conditions (dry eye, uveitis), trauma, family history of eye diseases..." {...field} />
                    </FormControl>
                     <FormDescription>Detail specific eye-related medical history.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Medical History</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Known allergies, chronic systemic conditions (diabetes, hypertension), past major surgeries, etc." {...field} />
                    </FormControl>
                    <FormDescription>Summarize relevant general medical background.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                control={form.control}
                name="currentMedications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Pill className="mr-2 h-4 w-4" />Current Medications</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Latanoprost 0.005% (1 drop OD nightly), Metformin 500mg (oral, BID), Aspirin 81mg (daily)" {...field} />
                    </FormControl>
                    <FormDescription>List all current medications (eye-related and systemic), separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="flex items-center text-lg mb-2"><History className="mr-2 h-5 w-5" />Treatment History</FormLabel>
                {fields.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_2fr_auto] gap-3 items-end p-3 mb-3 border rounded-md bg-secondary/30">
                    <FormField
                      control={form.control}
                      name={`treatmentHistory.${index}.date`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                           <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                  {field.value ? format(field.value, "PPP") : <span>Pick date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`treatmentHistory.${index}.treatment`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatment/Procedure</FormLabel>
                          <FormControl><Input placeholder="e.g., SLT, Anti-VEGF injection" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`treatmentHistory.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl><Input placeholder="e.g., OD, IOP reduced to 15" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="mb-1">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove treatment</span>
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({date: new Date(), treatment: "", notes: ""})}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Treatment Record
                </Button>
              </div>
              <Separator/>

              <h3 className="text-xl font-semibold text-primary pt-2">Administrative Information</h3>
              <h4 className="text-lg font-semibold text-primary/80">Emergency Contact (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 987-6543" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h4 className="text-lg font-semibold text-primary/80 pt-4">Insurance Details (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="insuranceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="HealthNet Ins." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insurancePolicyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Number</FormLabel>
                      <FormControl>
                        <Input placeholder="POL123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t mt-8">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Patient
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
