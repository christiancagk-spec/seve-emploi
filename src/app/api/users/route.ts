import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, unauthorized, forbidden } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

// GET /api/users — list all users (admin only)
export async function GET() {
  const user = await requireRole(["ADMIN"]);
  if (!user) return unauthorized();

  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

// POST /api/users — create user (admin only)
export async function POST(request: NextRequest) {
  const user = await requireRole(["ADMIN"]);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email deja utilise" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: { email, hashedPassword, firstName, lastName, role: role || "REFERENT" },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/users — update user (admin only)
export async function PATCH(request: NextRequest) {
  const user = await requireRole(["ADMIN"]);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { id, email, firstName, lastName, role, active, password } = body;

    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    const data: any = {};
    if (email !== undefined) data.email = email;
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (role !== undefined) data.role = role;
    if (active !== undefined) data.active = active;
    if (password) data.hashedPassword = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
