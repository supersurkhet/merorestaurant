import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Every 30 minutes, auto-cancel stale pending orders (> 2 hours old)
crons.interval(
  "cancel stale orders",
  { minutes: 30 },
  internal.cronHandlers.cancelStaleOrders,
);

export default crons;
