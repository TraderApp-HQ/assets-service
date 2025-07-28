export type FeatureFlagConfig = {
	[flagName in FeatureFlag]: {
		level: TrafficType;
	};
};

export enum TrafficType {
	USER = "user", // User ID level flag
	ROLE = "role", // USER Role level flag
}

/** Add/revise feature flags here, and then fill out the configuration below. */
export type FeatureFlag = "release-redis-cache";

// Dummy user id for split flag
export const redisFlagUserId = "assets_service_redis_flag_user_id";

export const FEATURE_FLAG_CONFIG: FeatureFlagConfig = {
	"release-redis-cache": {
		level: TrafficType.USER,
	},
};
