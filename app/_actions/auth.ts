'use server'

import { prisma } from "@/app/_lib/prisma"
import bcrypt from "bcryptjs"

export async function registerAction(data: any) {
  const { name, email, password } = data

  if (!email || !password || !name) {
    return { error: "Veuillez remplir tous les champs" }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "Cet email est déjà utilisé" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Une erreur est survenue lors de l'inscription" }
  }
}