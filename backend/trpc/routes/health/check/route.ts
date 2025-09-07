import { publicProcedure } from "../../../create-context";

export const healthCheckProcedure = publicProcedure.query(async () => {
  return {
    status: "ok",
    message: "Backend is connected and working!",
    timestamp: new Date().toISOString(),
  };
});

export default healthCheckProcedure;