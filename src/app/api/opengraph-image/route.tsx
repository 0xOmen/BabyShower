import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid");

  const user = fid ? await getNeynarUser(Number(fid)) : null;

  const response = new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col justify-center items-center relative"
        style={{ backgroundColor: "#f96da7" }}
      >
        {user?.pfp_url && (
          <div tw="flex w-96 h-96 rounded-full overflow-hidden mb-8 border-8 border-white">
            <img
              src={user.pfp_url}
              alt="Profile"
              tw="w-full h-full object-cover"
            />
          </div>
        )}
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

        {/* Advert Image */}
        <img
          src={`${
            process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
          }/advert.png`}
          alt="Advert"
          style={{
            marginBottom: "16px",
          }}
        />

        <h1 tw="text-8xl text-white">
          {user?.display_name
            ? `Baby Shower ${user.display_name ?? user.username}!`
            : "Baby Shower!"}
        </h1>
        <p tw="text-5xl mt-4 text-white opacity-80">Powered by Neynar 🪐</p>
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
