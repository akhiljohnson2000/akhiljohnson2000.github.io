"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const skillCategories = [
  {
    category: "Frontend Development",
    skills: [
      { name: "Angular", level: 95, years: 7 },
      { name: "React", level: 90, years: 5 },
      { name: "JavaScript (ES6+)", level: 95, years: 7 },
      { name: "TypeScript", level: 90, years: 7 },
      { name: "HTML5", level: 95, years: 7 },
      { name: "CSS3/SCSS/SASS", level: 90, years: 7 },
      { name: "RxJS, NgRx", level: 85, years: 5 },
    ],
  },
  {
    category: "Mobile Development",
    skills: [
      { name: "Ionic", level: 80, years: 4 },
      { name: "Cordova", level: 80, years: 4 },
      { name: "Android/iOS Deployment", level: 75, years: 3 },
    ],
  },
  {
    category: "Tools & Others",
    skills: [
      { name: "Node.js", level: 75, years: 4 },
      { name: "Git", level: 90, years: 7 },
      { name: "Webpack", level: 80, years: 5 },
      { name: "Unit Testing", level: 85, years: 5 },
      { name: "Figma/Sketch", level: 75, years: 4 },
      { name: "Performance Optimization", level: 85, years: 5 },
    ],
  },
]

export function Skills() {
  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Skills & Expertise</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6">{category.category}</h3>
                    <div className="space-y-6">
                      {category.skills.map((skill, skillIndex) => (
                        <div key={skillIndex}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{skill.name}</span>
                            <span className="text-muted-foreground text-sm">{skill.years} years</span>
                          </div>
                          <Progress value={skill.level} className="h-2" />
                        </div>
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
