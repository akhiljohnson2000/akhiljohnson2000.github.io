"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export function About() {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12">About Me</h2>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Thrissur, Kerala, India</span>
                </div>
              </div>

              <p className="mb-4">
                I'm a front-end developer with proven experience at Cakap and Qburst in helping them create and maintain
                a better code base for reusability. Passionate about learning and development with a desire to apply
                skills.
              </p>

              <p className="mb-4">
                With over 7 years of experience in Angular and 5 years in React, I've developed a strong foundation in
                building responsive, user-friendly web applications that deliver exceptional user experiences.
              </p>

              <p>
                I'm eager to tackle more complex problems and continue to find ways to maximize user efficiency. My
                expertise includes developing dashboards, RTC interfaces for video and audio conversations, and
                real-time chat services for interaction between users.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
