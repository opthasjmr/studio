

"use client"; // Add this if using hooks like useAuth directly or for interactions

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppHeader } from "@/components/layout/AppHeader"; // Keep for logged-out view
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Eye, Users, Activity, ShieldCheck, Microscope, BookOpen, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth to check login state
import { MedicalKnowledgeSearch } from "@/components/home/MedicalKnowledgeSearch"; // Import the new component

export default function HomePage() {
  const { user } = useAuth(); // Check if user is logged in

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Comprehensive Patient Management",
      description: "Easily manage patient records, medical history, and appointments in one secure place.",
    },
    {
      icon: <Eye className="h-8 w-8 text-primary" />,
      title: "AI-Powered Diagnostics",
      description: "Leverage cutting-edge AI to assist in analyzing eye scans for faster, more accurate insights.",
    },
    {
      icon: <Activity className="h-8 w-8 text-primary" />,
      title: "Streamlined Workflow",
      description: "Optimize your clinic's operations with intuitive scheduling, EMR, and billing.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Secure & Compliant",
      description: "Built with security and compliance at its core to protect sensitive patient data.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Conditionally render AppHeader only if user is not logged in, or AppHeader handles its visibility internally */}
      <AppHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Revolutionizing Eye Care with Vision Care Plus
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    An intelligent platform for ophthalmologists, empowering
                    you with AI-assisted diagnostics and seamless patient management.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    {/* Link to a features page or section */}
                    <Link href="#features">Learn More</Link> 
                  </Button>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/eyecarehero/600/400"
                alt="Hero Eye Care"
                data-ai-hint="eye care technology"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32"> {/* Added id for scroll linking */}
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need for Modern Eye Care
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Vision Care Plus provides a suite of tools designed to enhance
                  efficiency and improve patient outcomes in your ophthalmology practice.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:grid-cols-2">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      {feature.icon}
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Diagnostics Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-primary">
                AI-Assisted Diagnostics at Your Fingertips
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our advanced AI algorithms analyze OCT and fundus images to
                highlight potential anomalies and suggest diagnoses, helping you make
                informed decisions faster.
              </p>
              <ul className="grid gap-2 py-4">
                <li>
                  <CheckCircle className="mr-2 inline-block h-5 w-5 text-primary" />
                  Rapid identification of key indicators.
                </li>
                <li>
                  <CheckCircle className="mr-2 inline-block h-5 w-5 text-primary" />
                  Supports common eye conditions analysis.
                </li>
                <li>
                  <CheckCircle className="mr-2 inline-block h-5 w-5 text-primary" />
                  Continuously learning and improving.
                </li>
              </ul>
              <Button asChild>
                <Link href={user ? "/analyze-scan" : "/login?redirect=/analyze-scan"}>Try AI Analysis</Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <Image
                src="https://picsum.photos/seed/aidiagnostics/550/310"
                alt="AI Diagnostics"
                data-ai-hint="medical AI scan"
                width={550}
                height={310}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Medical Knowledge Search Section */}
        <section id="medical-search" className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
                <Brain className="inline-block h-5 w-5 mr-1" />
                Knowledge Hub
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Explore Ophthalmic Knowledge
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Access a vast repository of eye health information, research articles, and clinical data from authoritative sources. 
                Powered by AI for summarized insights.
              </p>
            </div>
            <MedicalKnowledgeSearch />
          </div>
        </section>


        {/* Call to Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-secondary">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Transform Your Practice?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join Vision Care Plus today and experience the future of eye care.
                Sign up for a demo or start your free trial.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-x-2">
              <Button asChild size="lg">
                <Link href="/signup">Sign Up Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Request a Demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Vision Care Plus. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

