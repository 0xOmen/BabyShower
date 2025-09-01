import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Temporarily commented out to test if this was the source of the problem
    // const jpfraneto = await getNeynarUser(16098);

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            height: "100%",
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            background: "linear-gradient(to bottom right, #ec4899, #2563eb)",
          }}
        >
          {/* App Logo */}
          <div
            style={{
              position: "absolute",
              top: "32px",
              left: "32px",
            }}
          >
            <img
              src={`${
                process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
              }/icon.png`}
              alt="App Logo"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "8px",
              }}
            />
          </div>

          {/* Main Content - Commented out due to broken image generation */}
          {/* <div tw="flex flex-col items-center justify-center text-center">
          {jpfraneto?.pfp_url && (
            <div tw="flex w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg">
              <img
                src={jpfraneto.pfp_url}
                alt="jpfraneto"
                tw="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 tw="text-6xl font-bold text-white mb-4 px-8 leading-tight">
            Join the 50/50 Baby Shower for JP
          </h1>

          <p tw="text-2xl text-white opacity-90 mb-6">
            Support new parents and win money! 🎉
          </p>
        </div>

        <div tw="absolute bottom-8 right-8 text-white opacity-70">
          <p tw="text-lg">Powered by Neynar 🪐</p>
        </div> */}
        </div>
      ),
      {
        width: 1200,
        height: 800,
      }
    );
  } catch (error) {
    console.error("Error generating OpenGraph image:", error);

    // Return a simple fallback image
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            height: "100%",
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(to bottom right, #ec4899, #2563eb)",
          }}
        >
          <div
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            Baby Shower Raffle
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800,
      }
    );
  }
}
