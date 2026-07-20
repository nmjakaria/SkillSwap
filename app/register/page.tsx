"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Sparkles, Loader2, UserPlus } from "lucide-react"

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const redirectTo = searchParams.get("redirect") || "/explore"

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)
    try {
      await authClient.signUp.email(
        {
          email: values.email,
          password: values.password,
          name: values.name,
        },
        {
          onRequest: () => {
            setIsLoading(true)
          },
          onSuccess: () => {
            setIsLoading(false)
            toast.success("Account created successfully!")
            router.push(redirectTo)
            router.refresh()
          },
          onError: (ctx) => {
            setIsLoading(false)
            toast.error(ctx.error.message || "Registration failed. Please try again.")
            form.setError("root", {
              message: ctx.error.message || "Registration failed. Account might already exist.",
            })
          },
        }
      )
    } catch (error) {
      setIsLoading(false)
      toast.error("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="flex flex-grow items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-neutral-bg">
      <Card className="w-full max-w-md border-border/40 shadow-xl shadow-teal/5 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal text-white shadow-md shadow-teal/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription>
            Join SkillSwap today to share skills, learn together, and swap expertise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root && (
                <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal"
                        disabled={isLoading}
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
                        type="email"
                        placeholder="you@example.com"
                        className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-background/50 focus-visible:ring-teal/30 focus-visible:border-teal"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-teal hover:bg-teal/90 text-white font-medium shadow-md shadow-teal/10 cursor-pointer mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign Up
                    <UserPlus className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t border-border/20 pt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-teal hover:text-teal/80 underline decoration-teal/30 underline-offset-4"
            >
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-grow items-center justify-center bg-neutral-bg">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
