/**
 * Facebook Marketing API Type Definitions
 * Comprehensive types for Facebook Business SDK integration
 */

// ==================== Authentication Types ====================

export interface FacebookOAuthTokens {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  issuedAt: number;
}

export interface FacebookSystemUserToken {
  accessToken: string;
  userId: string;
  businessId: string;
  expiresAt: number | null; // null for non-expiring tokens
}

export interface FacebookTokenMetadata {
  appId: string;
  userId: string;
  isValid: boolean;
  scopes: string[];
  expiresAt: number;
}

// ==================== Business Manager Types ====================

export interface FacebookBusiness {
  id: string;
  name: string;
  verificationStatus: string;
  profilePictureUri?: string;
  createdTime: string;
  updatedTime: string;
}

export interface FacebookBusinessUser {
  id: string;
  name: string;
  email?: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'DEVELOPER';
  permittedTasks: string[];
}

// ==================== Ad Account Types ====================

export interface FacebookAdAccount {
  id: string;
  accountId: string;
  name: string;
  accountStatus: AdAccountStatus;
  currency: string;
  timezone: string;
  businessId?: string;
  businessName?: string;
  amountSpent: number;
  balance: number;
  spendCap?: number;
  disableReason?: string;
  createdTime: string;
  fundingSourceDetails?: {
    id: string;
    displayString: string;
    type: string;
  };
}

export type AdAccountStatus =
  | 1  // ACTIVE
  | 2  // DISABLED
  | 3  // UNSETTLED
  | 7  // PENDING_RISK_REVIEW
  | 8  // PENDING_SETTLEMENT
  | 9  // IN_GRACE_PERIOD
  | 100  // PENDING_CLOSURE
  | 101; // CLOSED

// ==================== Campaign Types ====================

export interface FacebookCampaign {
  id: string;
  accountId: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  configuredStatus: CampaignStatus;
  effectiveStatus: EffectiveStatus;
  specialAdCategories: SpecialAdCategory[];
  dailyBudget?: number;
  lifetimeBudget?: number;
  budgetRemaining?: number;
  spendCap?: number;
  startTime?: string;
  stopTime?: string;
  createdTime: string;
  updatedTime: string;
  bidStrategy?: BidStrategy;
  toplineId?: string;
}

export type CampaignObjective =
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_SALES'
  | 'OUTCOME_TRAFFIC'
  | 'APP_INSTALLS'
  | 'BRAND_AWARENESS'
  | 'CONVERSIONS'
  | 'EVENT_RESPONSES'
  | 'LEAD_GENERATION'
  | 'LINK_CLICKS'
  | 'LOCAL_AWARENESS'
  | 'MESSAGES'
  | 'OFFER_CLAIMS'
  | 'PAGE_LIKES'
  | 'POST_ENGAGEMENT'
  | 'PRODUCT_CATALOG_SALES'
  | 'REACH'
  | 'STORE_VISITS'
  | 'VIDEO_VIEWS';

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';

export type EffectiveStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'DELETED'
  | 'PENDING_REVIEW'
  | 'DISAPPROVED'
  | 'PREAPPROVED'
  | 'PENDING_BILLING_INFO'
  | 'CAMPAIGN_PAUSED'
  | 'ARCHIVED'
  | 'ADSET_PAUSED'
  | 'IN_PROCESS'
  | 'WITH_ISSUES';

export type SpecialAdCategory = 'CREDIT' | 'EMPLOYMENT' | 'HOUSING' | 'NONE';

export type BidStrategy =
  | 'LOWEST_COST_WITHOUT_CAP'
  | 'LOWEST_COST_WITH_BID_CAP'
  | 'COST_CAP'
  | 'LOWEST_COST_WITH_MIN_ROAS';

// ==================== Ad Set Types ====================

export interface FacebookAdSet {
  id: string;
  accountId: string;
  campaignId: string;
  name: string;
  status: CampaignStatus;
  configuredStatus: CampaignStatus;
  effectiveStatus: EffectiveStatus;
  dailyBudget?: number;
  lifetimeBudget?: number;
  budgetRemaining?: number;
  billingEvent: BillingEvent;
  optimizationGoal: OptimizationGoal;
  bidAmount?: number;
  bidStrategy?: BidStrategy;
  targeting?: AdTargeting;
  startTime?: string;
  endTime?: string;
  createdTime: string;
  updatedTime: string;
  attribution_spec?: AttributionSpec[];
  promotedObject?: PromotedObject;
  pacing_type?: PacingType[];
  is_dynamic_creative?: boolean;
}

export type BillingEvent =
  | 'APP_INSTALLS'
  | 'CLICKS'
  | 'IMPRESSIONS'
  | 'LINK_CLICKS'
  | 'OFFER_CLAIMS'
  | 'PAGE_LIKES'
  | 'POST_ENGAGEMENT'
  | 'THRUPLAY'
  | 'PURCHASE';

export type OptimizationGoal =
  | 'AD_RECALL_LIFT'
  | 'APP_INSTALLS'
  | 'CONVERSATIONS'
  | 'DERIVED_EVENTS'
  | 'ENGAGED_USERS'
  | 'EVENT_RESPONSES'
  | 'IMPRESSIONS'
  | 'LANDING_PAGE_VIEWS'
  | 'LEAD_GENERATION'
  | 'LINK_CLICKS'
  | 'OFFSITE_CONVERSIONS'
  | 'PAGE_LIKES'
  | 'POST_ENGAGEMENT'
  | 'QUALITY_CALL'
  | 'QUALITY_LEAD'
  | 'REACH'
  | 'THRUPLAY'
  | 'VALUE'
  | 'VISIT_INSTAGRAM_PROFILE';

export type PacingType = 'standard' | 'day_parting' | 'no_pacing';

export interface PromotedObject {
  pixel_id?: string;
  custom_event_type?: string;
  page_id?: string;
  instagram_profile_id?: string;
  object_store_url?: string;
  application_id?: string;
  product_catalog_id?: string;
  product_set_id?: string;
  offer_id?: string;
  event_id?: string;
}

export interface AttributionSpec {
  event_type: string;
  window_days: number;
}

// ==================== Targeting Types ====================

export interface AdTargeting {
  age_min?: number;
  age_max?: number;
  genders?: (1 | 2)[]; // 1 = Male, 2 = Female
  geo_locations?: GeoLocation;
  detailed_targeting?: FlexibleTargeting[];
  excluded_connections?: Connection[];
  connections?: Connection[];
  custom_audiences?: CustomAudienceTargeting[];
  excluded_custom_audiences?: CustomAudienceTargeting[];
  languages?: number[];
  locales?: number[];
  publisher_platforms?: PublisherPlatform[];
  facebook_positions?: FacebookPosition[];
  instagram_positions?: InstagramPosition[];
  device_platforms?: DevicePlatform[];
  user_device?: string[];
  user_os?: string[];
  wireless_carrier?: string[];
  site_category?: string[];
  interests?: FlexibleTargeting[];
  behaviors?: FlexibleTargeting[];
  life_events?: FlexibleTargeting[];
  industries?: FlexibleTargeting[];
  relationship_statuses?: number[];
  household_composition?: number[];
  education_schools?: FlexibleTargeting[];
  education_majors?: FlexibleTargeting[];
  education_statuses?: number[];
  work_employers?: FlexibleTargeting[];
  work_positions?: FlexibleTargeting[];
  targeting_optimization?: string;
}

export interface GeoLocation {
  countries?: string[];
  cities?: GeoLocationCity[];
  regions?: GeoLocationRegion[];
  zips?: GeoLocationZip[];
  location_types?: LocationType[];
  custom_locations?: CustomLocation[];
}

export interface GeoLocationCity {
  key: string;
  name: string;
  radius?: number;
  distance_unit?: 'mile' | 'kilometer';
}

export interface GeoLocationRegion {
  key: string;
  name: string;
}

export interface GeoLocationZip {
  key: string;
  name: string;
  primary_city_id?: number;
  region_id?: number;
  country?: string;
}

export type LocationType = 'home' | 'recent' | 'travel_in';

export interface CustomLocation {
  latitude: number;
  longitude: number;
  radius: number;
  distance_unit: 'mile' | 'kilometer';
  address_string?: string;
  primary_city_id?: number;
  region_id?: number;
  country?: string;
}

export interface FlexibleTargeting {
  id: string | number;
  name?: string;
}

export interface Connection {
  id: string;
  connection_type?: string;
}

export interface CustomAudienceTargeting {
  id: string;
  name?: string;
}

export type PublisherPlatform = 'facebook' | 'instagram' | 'audience_network' | 'messenger';

export type FacebookPosition =
  | 'feed'
  | 'instant_article'
  | 'marketplace'
  | 'video_feeds'
  | 'story'
  | 'search'
  | 'instream_video'
  | 'right_hand_column';

export type InstagramPosition = 'stream' | 'story' | 'explore' | 'reels';

export type DevicePlatform = 'mobile' | 'desktop' | 'connected_tv';

// ==================== Ad Types ====================

export interface FacebookAd {
  id: string;
  accountId: string;
  campaignId: string;
  adsetId: string;
  name: string;
  status: CampaignStatus;
  configuredStatus: CampaignStatus;
  effectiveStatus: EffectiveStatus;
  createdTime: string;
  updatedTime: string;
  creative?: AdCreative;
  tracking_specs?: TrackingSpec[];
  conversion_specs?: ConversionSpec[];
  adlabels?: AdLabel[];
  preview_shareable_link?: string;
}

export interface AdCreative {
  id: string;
  name: string;
  title?: string;
  body?: string;
  call_to_action_type?: CallToActionType;
  image_hash?: string;
  image_url?: string;
  video_id?: string;
  thumbnail_url?: string;
  link_url?: string;
  object_story_spec?: ObjectStorySpec;
  asset_feed_spec?: AssetFeedSpec;
  degrees_of_freedom_spec?: DegreesOfFreedomSpec;
  instagram_actor_id?: string;
  instagram_permalink_url?: string;
  effective_instagram_story_id?: string;
  effective_object_story_id?: string;
}

export type CallToActionType =
  | 'APPLY_NOW'
  | 'BOOK_TRAVEL'
  | 'CALL_NOW'
  | 'CONTACT_US'
  | 'DOWNLOAD'
  | 'GET_DIRECTIONS'
  | 'GET_QUOTE'
  | 'INSTALL_APP'
  | 'INSTALL_MOBILE_APP'
  | 'LEARN_MORE'
  | 'LIKE_PAGE'
  | 'MESSAGE_PAGE'
  | 'NO_BUTTON'
  | 'OPEN_LINK'
  | 'ORDER_NOW'
  | 'PLAY_GAME'
  | 'SEE_MENU'
  | 'SHOP_NOW'
  | 'SIGN_UP'
  | 'SUBSCRIBE'
  | 'USE_APP'
  | 'USE_MOBILE_APP'
  | 'WATCH_MORE'
  | 'WHATSAPP_MESSAGE';

export interface ObjectStorySpec {
  page_id: string;
  instagram_actor_id?: string;
  link_data?: LinkData;
  photo_data?: PhotoData;
  video_data?: VideoData;
  template_data?: TemplateData;
}

export interface LinkData {
  attachment_style?: string;
  call_to_action?: {
    type: CallToActionType;
    value?: {
      link?: string;
      page?: string;
      application?: string;
    };
  };
  caption?: string;
  child_attachments?: LinkData[];
  description?: string;
  image_crops?: ImageCrops;
  image_hash?: string;
  link?: string;
  message?: string;
  multi_share_optimized?: boolean;
  name?: string;
  picture?: string;
}

export interface PhotoData {
  image_hash?: string;
  caption?: string;
  url?: string;
}

export interface VideoData {
  image_hash?: string;
  image_url?: string;
  video_id?: string;
  call_to_action?: {
    type: CallToActionType;
    value?: {
      link?: string;
      page?: string;
      application?: string;
    };
  };
  title?: string;
  message?: string;
}

export interface TemplateData {
  call_to_action?: {
    type: CallToActionType;
  };
  description?: string;
  link?: string;
  message?: string;
  name?: string;
}

export interface ImageCrops {
  '100x100'?: [number, number][];
  '100x72'?: [number, number][];
  '191x100'?: [number, number][];
  '400x150'?: [number, number][];
  '400x500'?: [number, number][];
  '600x360'?: [number, number][];
  '90x160'?: [number, number][];
}

export interface AssetFeedSpec {
  images?: AssetFeedSpecImage[];
  videos?: AssetFeedSpecVideo[];
  bodies?: AssetFeedSpecBody[];
  titles?: AssetFeedSpecTitle[];
  descriptions?: AssetFeedSpecDescription[];
  ad_formats?: string[];
  call_to_action_types?: CallToActionType[];
  link_urls?: AssetFeedSpecLinkURL[];
}

export interface AssetFeedSpecImage {
  hash?: string;
  url?: string;
  adlabels?: AdLabel[];
}

export interface AssetFeedSpecVideo {
  video_id?: string;
  thumbnail_hash?: string;
  thumbnail_url?: string;
  adlabels?: AdLabel[];
}

export interface AssetFeedSpecBody {
  text: string;
  adlabels?: AdLabel[];
}

export interface AssetFeedSpecTitle {
  text: string;
  adlabels?: AdLabel[];
}

export interface AssetFeedSpecDescription {
  text: string;
  adlabels?: AdLabel[];
}

export interface AssetFeedSpecLinkURL {
  website_url: string;
  adlabels?: AdLabel[];
}

export interface DegreesOfFreedomSpec {
  creative_features_spec?: {
    standard_enhancements?: {
      enroll_status?: 'OPT_IN' | 'OPT_OUT';
    };
  };
}

export interface TrackingSpec {
  action_type: string[];
  fb_pixel?: string[];
  page?: string[];
  application?: string[];
}

export interface ConversionSpec {
  action_type: string[];
  fb_pixel?: string[];
  page?: string[];
  application?: string[];
}

export interface AdLabel {
  id: string;
  name: string;
  created_time?: string;
  updated_time?: string;
}

// ==================== Insights/Metrics Types ====================

export interface FacebookInsights {
  date_start: string;
  date_stop: string;
  impressions?: number;
  reach?: number;
  frequency?: number;
  clicks?: number;
  unique_clicks?: number;
  spend?: number;
  cpm?: number;
  cpp?: number;
  cpc?: number;
  ctr?: number;
  unique_ctr?: number;
  actions?: ActionStat[];
  action_values?: ActionStat[];
  cost_per_action_type?: ActionStat[];
  conversions?: ActionStat[];
  conversion_values?: ActionStat[];
  cost_per_conversion?: ActionStat[];
  video_avg_time_watched_actions?: ActionStat[];
  video_p25_watched_actions?: ActionStat[];
  video_p50_watched_actions?: ActionStat[];
  video_p75_watched_actions?: ActionStat[];
  video_p100_watched_actions?: ActionStat[];
  website_ctr?: ActionStat[];
  website_purchase_roas?: ActionStat[];
  purchase_roas?: ActionStat[];
  mobile_app_purchase_roas?: ActionStat[];
}

export interface ActionStat {
  action_type: string;
  value: string | number;
  '1d_click'?: string;
  '7d_click'?: string;
  '28d_click'?: string;
  '1d_view'?: string;
  '7d_view'?: string;
  '28d_view'?: string;
}

export type InsightsDatePreset =
  | 'today'
  | 'yesterday'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_3d'
  | 'last_7d'
  | 'last_14d'
  | 'last_28d'
  | 'last_30d'
  | 'last_90d'
  | 'last_week_mon_sun'
  | 'last_week_sun_sat'
  | 'last_quarter'
  | 'last_year'
  | 'this_week_mon_today'
  | 'this_week_sun_today'
  | 'this_year'
  | 'lifetime'
  | 'maximum';

export type InsightsLevel = 'account' | 'campaign' | 'adset' | 'ad';

export type InsightsBreakdown =
  | 'age'
  | 'country'
  | 'dma'
  | 'gender'
  | 'frequency_value'
  | 'hourly_stats_aggregated_by_advertiser_time_zone'
  | 'hourly_stats_aggregated_by_audience_time_zone'
  | 'impression_device'
  | 'place_page_id'
  | 'publisher_platform'
  | 'platform_position'
  | 'device_platform'
  | 'product_id'
  | 'region';

export interface InsightsParams {
  level: InsightsLevel;
  date_preset?: InsightsDatePreset;
  time_range?: {
    since: string; // YYYY-MM-DD
    until: string; // YYYY-MM-DD
  };
  time_increment?: number | 'all_days' | 'monthly';
  fields?: string[];
  filtering?: InsightsFilter[];
  breakdowns?: InsightsBreakdown[];
  action_attribution_windows?: string[];
  action_breakdowns?: string[];
  action_report_time?: 'impression' | 'conversion';
  limit?: number;
}

export interface InsightsFilter {
  field: string;
  operator: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN';
  value: string | number | (string | number)[];
}

// ==================== Error Types ====================

export interface FacebookAPIError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  error_user_title?: string;
  error_user_msg?: string;
  fbtrace_id: string;
  is_transient?: boolean;
}

export interface RateLimitInfo {
  call_count: number;
  total_cputime: number;
  total_time: number;
  type: string;
  estimated_time_to_regain_access?: number;
}

// ==================== Request/Response Types ====================

export interface BatchRequest {
  method: 'GET' | 'POST' | 'DELETE';
  relative_url: string;
  body?: string;
  name?: string;
  depends_on?: string;
  omit_response_on_success?: boolean;
}

export interface BatchResponse {
  code: number;
  headers: Array<{ name: string; value: string }>;
  body: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
  summary?: Record<string, unknown>;
}

// ==================== Sync Types ====================

export interface SyncOptions {
  forceRefresh?: boolean;
  fields?: string[];
  limit?: number;
}

export interface SyncResult<T> {
  success: boolean;
  data?: T[];
  error?: FacebookAPIError;
  syncedAt: number;
  fromCache: boolean;
}

// ==================== Cache Types ====================

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

export type CacheTTL = {
  businesses: number;
  adAccounts: number;
  campaigns: number;
  adSets: number;
  ads: number;
  insights: number;
  targeting: number;
};

// ==================== Configuration Types ====================

export interface FacebookClientConfig {
  appId: string;
  appSecret: string;
  apiVersion: string;
  accessToken?: string;
  debug?: boolean;
}

export interface RateLimiterConfig {
  maxCallsPerHour: number;
  maxCallsPerAccount: number;
  batchSize: number;
  retryAttempts: number;
  retryDelayMs: number;
  backoffMultiplier: number;
}
