import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { NearbyPlace } from "~/types/place";

const clampCrowd = (value: number) => Math.min(100, Math.max(0, value));

export const placesRouter = createTRPCRouter({
  nearby: publicProcedure
    .input(
      z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .nullish(),
    )
    .query(({ input }) => {
      const baseLat = input?.lat ?? 50.1109;
      const baseLng = input?.lng ?? 8.6821;

      const places: NearbyPlace[] = [
        {
          name: "Cafe Central",
          lat: baseLat + 0.0011,
          lng: baseLng + 0.0008,
          crowdLevel: clampCrowd(30),
        },
        {
          name: "City Gym",
          lat: baseLat + 0.002,
          lng: baseLng - 0.0012,
          crowdLevel: clampCrowd(70),
        },
        {
          name: "Riverside Market",
          lat: baseLat - 0.0015,
          lng: baseLng + 0.0019,
          crowdLevel: clampCrowd(84),
        },
      ];

      return places;
    }),
});
