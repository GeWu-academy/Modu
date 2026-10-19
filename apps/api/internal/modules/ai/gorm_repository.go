package ai

import (
	"context"
	"errors"

	"gorm.io/gorm"
)

// GormRepository 是 Repository 的 GORM + PostgreSQL 实现。
type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) Get(ctx context.Context, tenantID string) (*ModuleSettings, error) {
	var settings ModuleSettings
	err := r.db.WithContext(ctx).Where("tenant_id = ?", tenantID).First(&settings).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &settings, nil
}

func (r *GormRepository) Save(ctx context.Context, settings *ModuleSettings) error {
	return r.db.WithContext(ctx).Save(settings).Error
}
