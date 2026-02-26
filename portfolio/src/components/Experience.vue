<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import Badge from '@/components/ui/Badge.vue'

const experiences = [
  {
    company: 'Clockhash Technologies',
    position: 'Senior Software Engineer',
    period: 'Jan 2025 – Present',
    location: 'Kochi',
    website: 'https://clockhash.com/',
    description: [
      'Owning and delivering end-to-end frontend features using React, Next.js, and React Native.',
      'Built reusable components and hooks aligned with a shared UI architecture.',
      'Improved SEO and performance through SSR, optimized rendering, and lazy loading.',
      'Collaborated closely with designers and backend engineers to translate UI/UX designs into scalable frontend solutions.',
    ],
    technologies: ['React', 'Next.js', 'React Native', 'TypeScript', 'SSR', 'SEO'],
  },
  {
    company: 'Cakap',
    position: 'Senior Software Engineer',
    period: 'Feb 2022 – Sept 2024',
    location: 'Jakarta, Indonesia (Remote)',
    website: 'https://cakap.com/',
    description: [
      'Developed large-scale React and Angular dashboards for teachers and students used by thousands of daily users.',
      'Built real-time React interfaces for video, audio, and chat using WebRTC (Twilio, Agora, Whereby).',
      'Designed reusable UI components and frontend libraries, contributing to design consistency and faster development cycles.',
      'Improved frontend performance by 35% through rendering optimizations, lazy loading, and efficient state management.',
      'Mentored junior engineers, led code reviews, and conducted knowledge-sharing sessions. Worked in Agile teams.',
    ],
    technologies: ['Angular', 'React', 'TypeScript', 'WebRTC', 'Twilio', 'Agora', 'Whereby'],
  },
  {
    company: 'QBurst',
    position: 'Senior Software Engineer',
    period: 'Oct 2018 – Feb 2022',
    location: 'Koratty Info Park, Thrissur',
    website: 'https://www.qburst.com/',
    description: [
      'Built scalable frontend applications using Angular and React for education and trading platforms.',
      'Implemented performance optimizations including code splitting and lazy loading, improving load times by 25%.',
      'Integrated REST APIs and collaborated with backend teams for seamless data flow.',
      'Contributed to mobile deployments using Cordova for Android and iOS.',
    ],
    technologies: ['Angular', 'React', 'Cordova', 'Highcharts', 'd3.js', 'MongoDB', 'SQL'],
  },
  {
    company: 'Perfomatix',
    position: 'Software Engineer',
    period: 'Jan 2018 – Oct 2018',
    location: 'Trivandrum',
    website: 'https://www.perfomatix.com/',
    description: [
      'Developed SPAs using Angular and React, improving engagement and responsiveness.',
      'Built data visualization dashboards using D3.js and Highcharts, reducing page load time by 30%.',
      'Ensured responsive and cross-browser compatible UI implementations.',
    ],
    technologies: ['Angular', 'React', 'Highcharts', 'd3.js', 'Node.js'],
  },
  {
    company: 'Jay4Web',
    position: 'Junior Software Engineer',
    period: 'Jul 2017 – Dec 2017',
    location: 'Ernakulam',
    website: 'https://jay4web.com/',
    description: [
      'Developed responsive web and hybrid mobile applications using Angular, Ionic, and Cordova.',
      'Collaborated with designers and backend developers to deliver user-friendly interfaces.',
    ],
    technologies: ['Angular', 'Ionic', 'Cordova'],
  },
]
</script>

<template>
  <section id="experience" class="section">
    <div class="container mx-auto px-4">
      <div
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }"
      >
        <h2 class="section-heading">Experience</h2>

        <div class="space-y-6">
          <div
            v-for="(exp, index) in experiences"
            :key="exp.company"
            v-motion
            :initial="{ opacity: 0, y: 12 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 0.32, delay: index * 60, ease: 'easeOut' } }"
          >
            <Card class="transition-shadow duration-300 hover:shadow-md">
              <CardHeader class="pb-3">
                <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                  <div>
                    <CardTitle class="text-lg">{{ exp.position }}</CardTitle>
                    <CardDescription class="mt-1">
                      <a
                        :href="exp.website"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="hover:text-primary transition-colors duration-200"
                      >
                        {{ exp.company }}
                      </a>
                      <span class="text-muted-foreground"> · {{ exp.location }}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" class="w-fit shrink-0 text-xs">
                    {{ exp.period }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent class="pt-0">
                <ul class="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground/90 mb-4">
                  <li v-for="(item, i) in exp.description" :key="i">{{ item }}</li>
                </ul>
                <div class="flex flex-wrap gap-1.5">
                  <Badge v-for="(tech, i) in exp.technologies" :key="i" variant="secondary" class="text-xs font-medium">
                    {{ tech }}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
