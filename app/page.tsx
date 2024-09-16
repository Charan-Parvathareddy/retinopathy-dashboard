'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      username === "iscs" &&
      password === "iscs@retinopathy"
    ) {
      localStorage.setItem('isLoggedIn', 'true')
      router.push("/Analysis")
    } else {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="h-[40rem] w-full rounded-md flex md:items-center md:justify-center bg-white/[0.96] antialiased bg-grid-black/[0.02] relative overflow-hidden">
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials below to login to your account.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit">
                Sign in
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}