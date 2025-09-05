import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import loginProcedure from "./routes/auth/login/route";
import createDeliveryProcedure from "./routes/deliveries/create/route";
import listDeliveriesProcedure from "./routes/deliveries/list/route";
import acceptDeliveryProcedure from "./routes/deliveries/accept/route";
import updateDeliveryStatusProcedure from "./routes/deliveries/update-status/route";
import toggleRiderStatusProcedure from "./routes/riders/toggle-status/route";
import updateRiderLocationProcedure from "./routes/riders/update-location/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    login: loginProcedure,
  }),
  deliveries: createTRPCRouter({
    create: createDeliveryProcedure,
    list: listDeliveriesProcedure,
    accept: acceptDeliveryProcedure,
    updateStatus: updateDeliveryStatusProcedure,
  }),
  riders: createTRPCRouter({
    toggleStatus: toggleRiderStatusProcedure,
    updateLocation: updateRiderLocationProcedure,
  }),
});

export type AppRouter = typeof appRouter;