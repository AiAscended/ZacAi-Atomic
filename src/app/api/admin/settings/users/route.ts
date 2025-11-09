/**
 * User Settings API Route
 *
 * Endpoints:
 * - GET /api/admin/settings/users - Get all users
 * - POST /api/admin/settings/users - Create new user
 * - PUT /api/admin/settings/users - Update user
 * - DELETE /api/admin/settings/users?id=user-123 - Delete user
 */

import { NextRequest, NextResponse } from "next/server";
import { settingsStore, UserSettings } from "@/lib/settingsStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = settingsStore.getAllUsers();
    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("[User Settings API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 },
      );
    }

    const newUser: UserSettings = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: role || "user",
      preferences: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = settingsStore.saveUser(newUser);

    return NextResponse.json({
      success: true,
      data: saved,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("[User Settings API] Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = settingsStore.saveUser(body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("[User Settings API] Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    const deleted = settingsStore.deleteUser(userId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("[User Settings API] Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
