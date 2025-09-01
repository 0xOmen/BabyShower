import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get("fid");

    if (!fid) {
      return NextResponse.json(
        { error: "FID parameter is required" },
        { status: 400 }
      );
    }

    // Fetch guesses for the specified user FID
    const { data, error } = await supabase
      .from("Guesses")
      .select("*")
      .eq("fid", fid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch guesses" },
        { status: 500 }
      );
    }

    console.log("Fetched guesses for FID:", fid, "Count:", data?.length || 0);
    return NextResponse.json({ guesses: data || [] });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { timestamp, user_address, fid, readable_time } =
      await request.json();

    // Validate required fields
    if (!timestamp || !user_address || !fid || !readable_time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert the guess into the database
    const { data, error } = await supabase
      .from("Guesses")
      .insert([
        {
          timestamp,
          user_address,
          fid,
          readable_time,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to insert guess" },
        { status: 500 }
      );
    }

    console.log("Database update successful:", {
      data,
      timestamp,
      user_address,
      fid,
      readable_time,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
