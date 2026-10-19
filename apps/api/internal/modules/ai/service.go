package ai

import (
	"context"
	"errors"
	"strings"
	"time"
)

// ErrInvalidRemoteURL 表示部署链接格式不合法。
var ErrInvalidRemoteURL = errors.New("remote url must start with http:// or https://")

// Service 承载 AI 模块设置的用例逻辑。
type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

// Get 返回指定租户的设置；不存在时返回空设置。
func (s *Service) Get(ctx context.Context, tenantID string) (*ModuleSettings, error) {
	settings, err := s.repo.Get(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	if settings == nil {
		return &ModuleSettings{TenantID: tenantID}, nil
	}
	return settings, nil
}

// Update 校验并保存部署链接。
func (s *Service) Update(ctx context.Context, tenantID, remoteURL string) (*ModuleSettings, error) {
	remoteURL = strings.TrimSpace(remoteURL)
	if remoteURL != "" && !strings.HasPrefix(remoteURL, "http://") && !strings.HasPrefix(remoteURL, "https://") {
		return nil, ErrInvalidRemoteURL
	}
	settings := &ModuleSettings{
		TenantID:  tenantID,
		RemoteURL: remoteURL,
		UpdatedAt: time.Now().UTC(),
	}
	if err := s.repo.Save(ctx, settings); err != nil {
		return nil, err
	}
	return settings, nil
}
