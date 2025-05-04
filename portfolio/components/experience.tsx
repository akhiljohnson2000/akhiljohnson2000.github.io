"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const experiences = [
  {
    company: "Cakap",
    position: "Senior Software Engineer",
    period: "Feb 2022 - Present",
    location: "Jakarta, Indonesia (Remote)",
    website: "https://cakap.com/",
    description: [
      "Worked on developing dashboards for Teachers and students for booking classes, coordinating mark sheets, and Tracking activities.",
      "Developed RTC interface for video and audio conversations and real-time chat service for interaction between Teachers and students.",
      "Mentored junior developers, conducted code reviews, and facilitated knowledge-sharing sessions to foster team growth and development.",
      "Optimized web and mobile application performance, leading to a 35% improvement in load times.",
    ],
    technologies: ["Angular", "React", "TypeScript", "Node.js", "Twilio.js", "Agora", "Whereby", "Socket.js"],
  },
  {
    company: "QBurst",
    position: "Senior Software Engineer",
    period: "Oct 2018 - Feb 2022",
    location: "Koratty Info Park, Thrissur",
    website: "https://www.qburst.com/",
    description: [
      "Built a kids management application for parents with Angular and Cordova facilitating improved student data management and communication between Parents and daycare.",
      "Created RESTful APIs and integrated them with front-end applications, enabling seamless data flow and efficient communication between client and server.",
      "Optimized web application performance, improving page load times by 25% through code splitting and lazy loading.",
      "Developed a trading application internally for automating trading strategies.",
    ],
    technologies: ["Angular", "React", "Cordova", "Highcharts", "d3.js", "MongoDB", "SQL"],
  },
  {
    company: "Perfomatix",
    position: "Software Engineer",
    period: "Jan 2018 - Oct 2018",
    location: "Carnival Techno Park, Trivandrum",
    website: "https://www.perfomatix.com/",
    description: [
      "Built dynamic single-page applications (SPAs) using Angular and React, improving user engagement and application performance.",
      "Developed the front end of a data visualization platform in Angular with highcharts.js and d3.js libraries. Reduced page load time by 30% and improving user engagement by 20%.",
      "Created a responsive internal dashboard for real-time data visualization using Angular, enhancing data accessibility and usability for team members.",
    ],
    technologies: ["Angular", "React", "Highcharts", "d3.js", "Node.js", "Sketch", "Figma"],
  },
  {
    company: "Jay4Web",
    position: "Jr. Software Engineer",
    period: "Jul 2017 - Dec 2017",
    location: "Ernakulam",
    website: "https://jay4web.com/",
    description: [
      "Developed and maintained user-friendly web applications using HTML, CSS, and JavaScript, ensuring responsive design and cross-browser compatibility.",
      "Built hybrid mobile applications using Cordova and Ionic, providing seamless user experiences across iOS and Android platforms.",
      "Collaborated with designers, back-end developers, and stakeholders to create intuitive and dynamic user interfaces.",
    ],
    technologies: ["Angular", "Ionic", "Cordova", "Google Maps"],
  },
]

export function Experience() {
  return (
    <section id="experience" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Work Experience</h2>

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div>
                        <CardTitle>{exp.position}</CardTitle>
                        <CardDescription>
                          <a
                            href={exp.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {exp.company}
                          </a>{" "}
                          • {exp.location}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {exp.period}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                      {exp.description.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {exp.technologies.map((tech, i) => (
                        <Badge key={i} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
