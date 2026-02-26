<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardFooter from '@/components/ui/CardFooter.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ExternalLink, Github } from 'lucide-vue-next'

function isInternalLink(link?: string) {
  return link?.startsWith('/')
}

const activeTab = ref<'career' | 'personal'>('career')

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
    title: 'JavaScript Engine Visualizer',
    description:
      'Interactive 3D simulation of how a JavaScript engine works: Call Stack, Heap, Web APIs, Event Loop, Microtask and Callback queues. Run code in slow motion.',
    image: '/placeholder.svg?height=200&width=400',
    technologies: ['Vue 3', 'Three.js', 'GSAP', 'TypeScript'],
    link: '/javascript-engine-visualizer',
  },
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
  <section id="projects" class="section-alt">
    <div class="container mx-auto px-4">
      <div
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }"
      >
        <h2 class="section-heading">Projects</h2>

        <div class="w-full">
          <div class="grid w-full max-w-md mx-auto grid-cols-2 mb-12 rounded-md bg-muted p-1 text-muted-foreground">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              :class="activeTab === 'career' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground'"
              @click="activeTab = 'career'"
            >
              Career Projects
            </button>
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              :class="activeTab === 'personal' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground'"
              @click="activeTab = 'personal'"
            >
              Personal Projects
            </button>
          </div>

          <div v-show="activeTab === 'career'" class="mt-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="(project, index) in careerProjects"
                :key="index"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { duration: 0.32, delay: index * 60, ease: 'easeOut' } }"
              >
                <Card class="h-full flex flex-col transition-shadow duration-300 hover:shadow-md">
                  <div class="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      :src="project.image || '/placeholder.svg'"
                      :alt="project.title"
                      class="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-[1.02]"
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
                    <RouterLink v-if="project.link && isInternalLink(project.link)" :to="project.link" class="inline-flex items-center justify-center h-9 rounded-md px-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Visit
                    </RouterLink>
                    <Button v-else-if="project.link" size="sm" as="a" :href="project.link" target="_blank" rel="noopener noreferrer">
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Visit
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'personal'" class="mt-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="(project, index) in personalProjects"
                :key="index"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { duration: 0.32, delay: index * 60, ease: 'easeOut' } }"
              >
                <Card class="h-full flex flex-col transition-shadow duration-300 hover:shadow-md">
                  <div class="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      :src="project.image || '/placeholder.svg'"
                      :alt="project.title"
                      class="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-[1.02]"
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
                    <RouterLink v-if="project.link && isInternalLink(project.link)" :to="project.link" class="inline-flex items-center justify-center h-9 rounded-md px-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Visit
                    </RouterLink>
                    <Button v-else-if="project.link" size="sm" as="a" :href="project.link" target="_blank" rel="noopener noreferrer">
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Visit
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
