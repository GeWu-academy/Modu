package ai

import "time"

// ModuleSettings 是实例级的 Modu-AI 模块配置。
type ModuleSettings struct {
	TenantID  string    `gorm:"column:tenant_id;primaryKey"`
	RemoteURL string    `gorm:"column:remote_url"`
	UpdatedAt time.Time `gorm:"column:updated_at"`
}

// TableName 指定表名。
func (ModuleSettings) TableName() string { return "ai_module_settings" }
