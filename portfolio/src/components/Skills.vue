<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Progress from '@/components/ui/Progress.vue'

const skillCategories = [
  {
    category: 'Frontend Development',
    skills: [
      { name: 'Angular', level: 95, years: 7 },
      { name: 'React', level: 90, years: 5 },
      { name: 'JavaScript (ES6+)', level: 95, years: 7 },
      { name: 'TypeScript', level: 90, years: 7 },
      { name: 'HTML5', level: 95, years: 7 },
      { name: 'CSS3/SCSS/SASS', level: 90, years: 7 },
      { name: 'RxJS, NgRx', level: 85, years: 5 },
    ],
  },
  {
    category: 'Mobile Development',
    skills: [
      { name: 'Ionic', level: 80, years: 4 },
      { name: 'Cordova', level: 80, years: 4 },
      { name: 'Android/iOS Deployment', level: 75, years: 3 },
    ],
  },
  {
    category: 'Tools & Others',
    skills: [
      { name: 'Node.js', level: 75, years: 4 },
      { name: 'Git', level: 90, years: 7 },
      { name: 'Webpack', level: 80, years: 5 },
      { name: 'Unit Testing', level: 85, years: 5 },
      { name: 'Figma/Sketch', level: 75, years: 4 },
      { name: 'Performance Optimization', level: 85, years: 5 },
    ],
  },
]
</script>

<template>
  <section id="skills" class="py-20">
    <div class="container mx-auto px-4">
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
      >
        <h2 class="text-3xl font-bold text-center mb-12">Skills & Expertise</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(category, categoryIndex) in skillCategories"
            :key="categoryIndex"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: categoryIndex * 100 } }"
          >
            <Card class="h-full">
              <CardContent class="p-6">
                <h3 class="text-xl font-semibold mb-6">{{ category.category }}</h3>
                <div class="space-y-6">
                  <div v-for="(skill, skillIndex) in category.skills" :key="skillIndex">
                    <div class="flex justify-between mb-2">
                      <span class="font-medium">{{ skill.name }}</span>
                      <span class="text-muted-foreground text-sm">{{ skill.years }} years</span>
                    </div>
                    <Progress :value="skill.level" class="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
