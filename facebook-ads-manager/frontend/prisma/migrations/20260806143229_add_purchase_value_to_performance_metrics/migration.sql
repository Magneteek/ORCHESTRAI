-- Add revenue column so aggregate ROAS can be computed as sum(purchaseValue)/sum(spend)
ALTER TABLE "performance_metrics" ADD COLUMN "purchaseValue" DOUBLE PRECISION;
