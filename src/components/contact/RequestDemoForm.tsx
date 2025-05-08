
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useState } from "react";
import { Loader2, Send, Building, Users, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const requestDemoFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  roleTitle: z.string().optional(),
  numUsers: z.string().optional(),
  message: z.string().optional(),
});

export function RequestDemoForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof requestDemoFormSchema>>({
    resolver: zodResolver(requestDemoFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyName: "",
      roleTitle: "",
      numUsers: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof requestDemoFormSchema>) {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Demo Request Submitted:", values);

    toast({
      title: "Demo Request Sent!",
      description: "Thank you for your interest. We will get back to you shortly.",
    });
    form.reset();
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Send className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Request a Demo</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Interested in Vision Care Plus? Fill out the form below, and our team will contact you to schedule a personalized demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Dr. Jane Doe" {...field} />
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
                        <Input type="email" placeholder="you@clinic.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4 opacity-70" />Clinic/Company Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Bright Eyes Clinic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="roleTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Briefcase className="mr-2 h-4 w-4 opacity-70" />Your Role/Title (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Ophthalmologist, Clinic Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Users className="mr-2 h-4 w-4 opacity-70" />Number of Potential Users (Optional)</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an estimate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-5">1-5 Users</SelectItem>
                          <SelectItem value="6-10">6-10 Users</SelectItem>
                          <SelectItem value="11-20">11-20 Users</SelectItem>
                          <SelectItem value="20+">20+ Users</SelectItem>
                          <SelectItem value="not-sure">Not Sure Yet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Interests or Questions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about any specific features you're interested in, or any questions you have."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Request Demo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
