-- Facebook's `clicks` counts every click on the ad (reactions, comments, saves,
-- post expands, video plays). `inline_link_clicks` counts only clicks that
-- followed the link, which is the denominator conversion-rate benchmarks use.
-- Nullable so rows synced before this column existed stay distinguishable from
-- a genuine zero.
ALTER TABLE "performance_metrics" ADD COLUMN "linkClicks" BIGINT;
