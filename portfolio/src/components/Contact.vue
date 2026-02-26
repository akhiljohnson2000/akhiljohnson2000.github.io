<script setup lang="ts">
import { ref } from 'vue'
import { Mail, MapPin, Phone } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import { useToast } from '@/composables/useToast'

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})
const isSubmitting = ref(false)
const { toast } = useToast()

function handleSubmit(e: Event) {
  e.preventDefault()
  isSubmitting.value = true

  setTimeout(() => {
    toast({
      title: 'Message sent!',
      description: "Thank you for your message. I'll get back to you soon.",
    })
    formData.value = { name: '', email: '', subject: '', message: '' }
    isSubmitting.value = false
  }, 1500)
}
</script>

<template>
  <section id="contact" class="py-20 bg-muted/30">
    <div class="container mx-auto px-4">
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
      >
        <h2 class="text-3xl font-bold text-center mb-12">Get In Touch</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Feel free to reach out to me through any of these channels.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-center">
                <MapPin class="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p class="font-medium">Location</p>
                  <p class="text-muted-foreground">Thrissur, Kerala, India</p>
                </div>
              </div>

              <div class="flex items-center">
                <Mail class="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p class="font-medium">Email</p>
                  <a
                    href="mailto:akhiljohnson2000@gmail.com"
                    class="text-muted-foreground hover:text-primary transition-colors"
                  >
                    akhiljohnson2000@gmail.com
                  </a>
                </div>
              </div>

              <div class="flex items-center">
                <Phone class="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p class="font-medium">Phone</p>
                  <a href="tel:+919809194911" class="text-muted-foreground hover:text-primary transition-colors">
                    +91 9809194911
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>Fill out the form below and I'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <form class="space-y-4" @submit="handleSubmit">
                <div>
                  <Input
                    v-model="formData.name"
                    placeholder="Your Name"
                    name="name"
                    required
                  />
                </div>
                <div>
                  <Input
                    v-model="formData.email"
                    type="email"
                    placeholder="Your Email"
                    name="email"
                    required
                  />
                </div>
                <div>
                  <Input
                    v-model="formData.subject"
                    placeholder="Subject"
                    name="subject"
                    required
                  />
                </div>
                <div>
                  <Textarea
                    v-model="formData.message"
                    placeholder="Your Message"
                    name="message"
                    :rows="5"
                    required
                  />
                </div>
                <Button type="submit" class="w-full" :disabled="isSubmitting">
                  {{ isSubmitting ? 'Sending...' : 'Send Message' }}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </section>
</template>
