"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Github } from "lucide-react"

// Career projects based on the resume
const careerProjects = [
  {
    title: "KidKiosk",
    description:
      "A kids management application for parents built with Angular and Cordova, facilitating improved student data management and communication between parents and daycare.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["Angular", "Cordova", "TypeScript", "SCSS"],
    link: "https://www.kidkiosk.com",
    company: "QBurst",
  },
  {
    title: "Cakap Learning Platform",
    description:
      "Developed dashboards for teachers and students for booking classes, coordinating mark sheets, and tracking activities. Implemented RTC interface for video/audio conversations.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["Angular", "React", "TypeScript", "Twilio.js", "Agora"],
    link: "https://cakap.com",
    company: "Cakap",
  },
  {
    title: "Ecosystm Data Visualization",
    description:
      "Developed the front end of a data visualization platform in Angular with highcharts.js and d3.js libraries. Reduced page load time by 30% and improved user engagement by 20%.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["Angular", "Highcharts", "d3.js", "TypeScript"],
    link: "https://ecosystm.io/",
    company: "Perfomatix",
  },
  {
    title: "Trading Application",
    description:
      "Developed an internal trading application for automating trading strategies with real-time data visualization and analytics.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["Angular", "React", "d3.js", "MongoDB"],
    company: "QBurst",
  },
]

// Personal projects (example projects since none were specified)
const personalProjects = [
  {
    title: "Portfolio Website",
    description:
      "A modern, responsive portfolio website built with Next.js and Tailwind CSS to showcase my skills and projects.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
    github: "https://github.com/akhiljohnson2000/portfolio",
    link: "https://akhiljohnson2000.github.io",
  },
  {
    title: "Weather Dashboard",
    description:
      "A weather dashboard application that provides real-time weather information for any location using the OpenWeatherMap API.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["React", "TypeScript", "Tailwind CSS", "OpenWeatherMap API"],
    github: "https://github.com/akhiljohnson2000/weather-dashboard",
  },
  {
    title: "Task Management App",
    description:
      "A full-stack task management application with authentication, task creation, and organization features.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["Angular", "Node.js", "Express", "MongoDB"],
    github: "https://github.com/akhiljohnson2000/task-manager",
  },
  {
    title: "E-commerce UI Components",
    description:
      "A collection of reusable UI components for e-commerce applications, including product cards, shopping carts, and checkout forms.",
    image: "/placeholder.svg?height=200&width=400",
    technologies: ["React", "Storybook", "Styled Components"],
    github: "https://github.com/akhiljohnson2000/ecommerce-components",
  },
]

export function Projects() {
  return (
    <section id="projects" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Projects</h2>

          <Tabs defaultValue="career" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="career">Career Projects</TabsTrigger>
              <TabsTrigger value="personal">Personal Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="career">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careerProjects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="personal">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personalProjects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Card className="h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{project.title}</CardTitle>
            {project.company && <CardDescription>{project.company}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech: string, i: number) => (
            <Badge key={i} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {project.github && (
          <Button variant="outline" size="sm" asChild>
            <a href={project.github} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </a>
          </Button>
        )}
        {project.link && (
          <Button size="sm" asChild>
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
