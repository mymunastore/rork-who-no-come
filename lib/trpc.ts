import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // For development, use the backend URL provided by the platform
  if (typeof window !== 'undefined') {
    // In browser/web environment
    const currentUrl = window.location.origin;
    // Use the same origin for API calls in development
    return currentUrl;
  }
  
  // For mobile apps, you might need to configure this differently
  // Default to localhost for development
  return process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:3000';
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});