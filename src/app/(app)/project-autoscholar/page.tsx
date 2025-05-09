"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlaskConical, Target, FolderOpen, Settings2, ClipboardCheck, CalendarClock, Presentation } from "lucide-react";

const projectComponents = [
  {
    title: "1. Literature Review",
    content: [
      "Investigate recent advancements in AI for research generation (2023–2025).",
      "Tools: ChatGPT Deep Research, Tlooto, STORM, ScienceSage, NotebookLM.",
      "Focus on: Knowledge base creation, multimodal processing, citation accuracy, autonomous reasoning.",
    ],
  },
  {
    title: "2. Feature Benchmarking",
    content: [
      "Compare tools on:",
      "- Citation integrity",
      "- AI reasoning depth",
      "- Multimodal data handling",
      "- Workflow integration (writing + publishing)",
      "- Transparency and ethics",
      "Output: Feature comparison matrix with scoring (quantitative + qualitative).",
    ],
  },
  {
    title: "3. Prototype Design: “AutoScholar”",
    content: [
      "Goal: Build a lightweight web-based tool integrating open APIs (e.g., OpenAI, arXiv, Zotero) for:",
      "- Research topic generation",
      "- Literature review synthesis",
      "- Citation management",
      "- Report structuring and exporting",
      "Tech Stack:",
      "- Frontend: React.js",
      "- Backend: Python (Flask or FastAPI)",
      "- AI/ML: GPT-4.5 API or other LLMs",
      "- DB: PostgreSQL (to store knowledge graph entries)",
    ],
  },
  {
    title: "4. Use Case Simulations",
    content: [
      "Simulate real-world research tasks:",
      "- Writing a literature review on “AI in Education”",
      "- Extracting insights from PDFs, YouTube lectures, and datasets",
      "- Exporting a preprint-ready document",
    ],
  },
  {
    title: "5. Evaluation",
    content: [
      "Metrics:",
      "- Time saved vs traditional research",
      "- Accuracy of citations",
      "- Relevance of AI-generated insights",
      "User testing: Surveys with researchers, students, or educators",
    ],
  },
];

const deliverables = [
  "Detailed project report",
  "Feature matrix and evaluation results",
  "Demo video or working prototype of “AutoScholar”",
  "GitHub repository with documentation",
  "Presentation slides",
];

const timeline = [
  { week: 1, activity: "Literature review" },
  { week: 2, activity: "Feature benchmarking" },
  { week: "3–4", activity: "Prototype development" },
  { week: 5, activity: "Integrating APIs and citation tools" },
  { week: 6, activity: "Testing and evaluation" },
  { week: 7, activity: "Report writing" },
  { week: 8, activity: "Presentation & final submission" },
];

export default function ProjectAutoScholarPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <FlaskConical className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">
                AI-Powered Generative Research Suite: A Comparative Study and Prototype Design
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                Project "AutoScholar"
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3 flex items-center">
              <Target className="mr-2 h-6 w-6" /> Objective
            </h2>
            <p className="text-muted-foreground">
              To evaluate, compare, and integrate cutting-edge generative AI tools into a unified research workflow, culminating in a prototype that automates the academic research lifecycle—from idea generation to manuscript publication.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
              <FolderOpen className="mr-2 h-6 w-6" /> Project Components
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {projectComponents.map((component, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg hover:no-underline">
                    <div className="flex items-center">
                      <Settings2 className="mr-3 h-5 w-5 text-muted-foreground" />
                      {component.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-1 pl-8 text-muted-foreground">
                      {component.content.map((item, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/- /g, "&ndash; ") }} />
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3 flex items-center">
              <ClipboardCheck className="mr-2 h-6 w-6" /> Deliverables
            </h2>
            <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
              {deliverables.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
              <CalendarClock className="mr-2 h-6 w-6" /> Timeline (Sample - 8 weeks)
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Week</TableHead>
                    <TableHead>Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeline.map((item) => (
                    <TableRow key={item.week}>
                      <TableCell className="font-medium">{item.week}</TableCell>
                      <TableCell>{item.activity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
          
          <section className="mt-10 pt-6 border-t">
             <h2 className="text-2xl font-semibold text-primary mb-3 flex items-center">
                <Presentation className="mr-2 h-6 w-6" /> Next Steps
            </h2>
            <p className="text-muted-foreground">
                This project outline can be further developed into a formal proposal, a detailed research paper, or a pitch document for project funding or academic coursework.
            </p>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}