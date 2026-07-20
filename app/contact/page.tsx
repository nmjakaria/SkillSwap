"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Mail, MapPin, Phone, Send } from "lucide-react"

// Simple schema for the contact form
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactPage() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  const onSubmit = (values: ContactFormValues) => {
    // Construct mailto link since there is no backend endpoint yet
    const subject = encodeURIComponent(`Contact from ${values.name} via SkillSwap`)
    const body = encodeURIComponent(
      `Name: ${values.name}\nEmail: ${values.email}\n\nMessage:\n${values.message}`
    )
    
    // Using a generic support email for the platform
    window.location.href = `mailto:support@skillswap.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-12 flex-grow">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Get in Touch
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Have a question, feedback, or want to partner with us? We'd love to hear from you. Fill out the form below or reach out directly.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-start">
        
        {/* Contact Information Sidebar */}
        <div className="space-y-8 bg-muted/30 p-8 rounded-2xl border border-border/40 h-full">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-teal/10 p-3 rounded-full text-teal shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Email</p>
                  <p className="text-muted-foreground text-sm">support@skillswap.com</p>
                  <p className="text-muted-foreground text-sm mt-1">We aim to reply within 24 hours.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-coral/10 p-3 rounded-full text-coral shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Office</p>
                  <p className="text-muted-foreground text-sm">123 Exchange Street</p>
                  <p className="text-muted-foreground text-sm">San Francisco, CA 94103</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-500/10 p-3 rounded-full text-blue-500 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Phone</p>
                  <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
                  <p className="text-muted-foreground text-sm mt-1">Mon-Fri, 9am to 5pm PST</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card p-8 rounded-2xl border border-border/40 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Jane Doe" 
                          className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="jane@example.com" 
                          className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How can we help you?"
                        rows={6}
                        className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-teal hover:bg-teal/90 text-white gap-2 cursor-pointer shadow-md shadow-teal/10 px-8"
              >
                <Send className="h-4 w-4" />
                Send Message
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Note: This will open your default email client to send the message.
              </p>
            </form>
          </Form>
        </div>

      </div>
    </div>
  )
}
