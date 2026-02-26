<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardFooter from '@/components/ui/CardFooter.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import TabsContent from '@/components/ui/TabsContent.vue'
import { ExternalLink, Github } from 'lucide-vue-next'

interface Project {
  title: string
  description: string
  image: string
  technologies: string[]
  link?: string
  github?: string
  company?: string
}

const careerProjects: Project[] = [
  {
    title: 'KidKiosk',
    description:
      'A kids management application for parents built with Angular and Cordova, facilitating improved student data management and communication between parents and daycare.',
    image: '/placeholder.svg?height=200&width=400',
    technologies: ['Angular', 'Cordova', 'TypeScript', 'SCSS'],
    link: 'https://www.kidkiosk.com',
    company: 'QBurst',
  },
  {
    title: 'Cakap Learning Platform',
    description:
      'Developed dashboards for teachers and students for booking classes, coordinating mark sheets, and tracking activities. Implemented RTC interface for video/audio conversations.',
    image: '/placeholder.svg?height=200&width=400',
    technologies: ['Angular', 'React', 'TypeScript', 'Twilio.js', 'Agora'],
    link: 'https://cakap.com',
    company: 'Cakap',
  },
  {
    title: 'Ecosystm Data Visualization',
    description:
      'Developed the front end of a data visualization platform in Angular with highcharts.js and d3.js libraries. Reduced page load time by 30% and improved user engagement by 20%.',
    image: '/placeholder.svg?height=200&width=400',
    technologies: ['Angular', 'Highcharts', 'd3.js', 'TypeScript'],
    link: 'https://ecosystm.io/',
    company: 'Perfomatix',
  },
  {
    title: 'Trading Application',
    description:
      'Developed an internal trading application for automating trading strategies with real-time data visualization and analytics.',
    image: '/placeholder.svg?height=200&width=400',
    technologies: ['Angular', 'React', 'd3.js', 'MongoDB'],
    company: 'QBurst',
  },
]

const personalProjects: Project[] = [
  {
    title: 'Portfolio Website',
    description:
      'A modern, responsive portfolio website built with Vue.js and Tailwind CSS to showcase my skills and projects.',
    image: '/placeholder.svg?height=200&width=400',
    technologies: ['Vue.js', 'Vite', 'Tailwind CSS', 'TypeScript'],
    github: 'https://github.com/akhiljohnson2000/portfolio',
    link: 'https://akhiljohnson2000.github.io',
  },
  {
    title: 'Weather Dashboard',
    description:
      'A weather dashboard application that provides real-time weather information for any location using the OpenWeatherMap API.',
    image: '/placeholder.svg?height=200&width=400',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'OpenWeatherMap API'],
    github: 'https://github.com/akhiljohnson2000/weather-dashboard',
  },
  {
    title: 'Task Management App',
    description:
      'A full-stack task management application with authentication, task creation, and organization features.',
    image: '/placeholder.svg?height=200&width=400',
    technologies: ['Angular', 'Node.js', 'Express', 'MongoDB'],
    github: 'https://github.com/akhiljohnson2000/task-manager',
  },
  {
    title: 'E-commerce UI Components',
    description:
      'A collection of reusable UI components for e-commerce applications, including product cards, shopping carts, and checkout forms.',
    image: '/placeholder.svg?height=200&width=400',
    technologies: ['React', 'Storybook', 'Styled Components'],
    github: 'https://github.com/akhiljohnson2000/ecommerce-components',
  },
]
</script>

<template>
  <section id="projects" class="py-20 bg-muted/30">
    <div class="container mx-auto px-4">
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
      >
        <h2 class="text-3xl font-bold text-center mb-12">Projects</h2>

        <Tabs default-value="career" class="w-full">
          <TabsList class="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="career">Career Projects</TabsTrigger>
            <TabsTrigger value="personal">Personal Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="career">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="(project, index) in careerProjects"
                :key="index"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: index * 100 } }"
              >
                <Card class="h-full flex flex-col">
                  <div class="aspect-video w-full overflow-hidden">
                    <img
                      :src="project.image || '/placeholder.svg'"
                      :alt="project.title"
                      class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div class="flex justify-between items-start">
                      <div>
                        <CardTitle>{{ project.title }}</CardTitle>
                        <CardDescription v-if="project.company">{{ project.company }}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent class="flex-grow">
                    <p class="text-muted-foreground mb-4">{{ project.description }}</p>
                    <div class="flex flex-wrap gap-2">
                      <Badge v-for="(tech, i) in project.technologies" :key="i" variant="secondary">
                        {{ tech }}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter class="flex gap-2">
                    <Button v-if="project.github" variant="outline" size="sm" as="a" :href="project.github" target="_blank" rel="noopener noreferrer">
                      <Github class="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                    <Button v-if="project.link" size="sm" as="a" :href="project.link" target="_blank" rel="noopener noreferrer">
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Visit
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="personal">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="(project, index) in personalProjects"
                :key="index"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: index * 100 } }"
              >
                <Card class="h-full flex flex-col">
                  <div class="aspect-video w-full overflow-hidden">
                    <img
                      :src="project.image || '/placeholder.svg'"
                      :alt="project.title"
                      class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div class="flex justify-between items-start">
                      <div>
                        <CardTitle>{{ project.title }}</CardTitle>
                        <CardDescription v-if="project.company">{{ project.company }}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent class="flex-grow">
                    <p class="text-muted-foreground mb-4">{{ project.description }}</p>
                    <div class="flex flex-wrap gap-2">
                      <Badge v-for="(tech, i) in project.technologies" :key="i" variant="secondary">
                        {{ tech }}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter class="flex gap-2">
                    <Button v-if="project.github" variant="outline" size="sm" as="a" :href="project.github" target="_blank" rel="noopener noreferrer">
                      <Github class="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                    <Button v-if="project.link" size="sm" as="a" :href="project.link" target="_blank" rel="noopener noreferrer">
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Visit
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </section>
</template>
