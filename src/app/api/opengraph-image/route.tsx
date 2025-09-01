import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Get jpfraneto's user data (FID: 16098 based on HomeTab.tsx)
  const jpfraneto = await getNeynarUser(16098);

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-center items-center relative bg-gradient-to-br from-pink-500 to-blue-600">
        {/* App Logo */}
        <div tw="absolute top-8 left-8">
          <img src="/icon.png" alt="App Logo" tw="w-16 h-16 rounded-lg" />
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
}
