package ai

import "context"

// Repository 是 AI 模块设置的持久化契约（实现细节隔离在基础设施层）。
type Repository interface {
	Get(ctx context.Context, tenantID string) (*ModuleSettings, error)
	Save(ctx context.Context, settings *ModuleSettings) error
}
