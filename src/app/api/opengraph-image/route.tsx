import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Get the profile picture for FID 16098 (jpfraneto)
  const jpfraneto = await getNeynarUser(16098);

  const response = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f96da7",
          position: "relative",
        }}
      >
        {/* App Logo */}
        <img
          src={`${
            process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
          }/icon.png`}
          alt="App Logo"
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        />

        {/* Profile Picture and Text Container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
          }}
        >
          {/* Profile Picture */}
          {jpfraneto?.pfp_url && (
            <img
              src={jpfraneto.pfp_url}
              alt="jpfraneto Profile"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: "6px solid white",
              }}
            />
          )}

          {/* Text */}
          <h1
            style={{
              fontSize: "64px",
              color: "white",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            Join jpfranetos&apos;s Baby Shower!
          </h1>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );

  // Set cache control to 5 minutes
  response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");

  return response;
}
