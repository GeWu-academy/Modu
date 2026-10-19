package ai

import (
	"context"
	"errors"
	"testing"
)

type fakeRepository struct {
	stored *ModuleSettings
	saved  *ModuleSettings
}

func (f *fakeRepository) Get(_ context.Context, _ string) (*ModuleSettings, error) {
	return f.stored, nil
}

func (f *fakeRepository) Save(_ context.Context, settings *ModuleSettings) error {
	f.saved = settings
	return nil
}

func TestUpdateRejectsInvalidURL(t *testing.T) {
	service := NewService(&fakeRepository{})
	if _, err := service.Update(context.Background(), "default", "ftp://example.com"); !errors.Is(err, ErrInvalidRemoteURL) {
		t.Fatalf("expected ErrInvalidRemoteURL, got %v", err)
	}
}

func TestUpdateTrimsAndAcceptsHTTPS(t *testing.T) {
	repo := &fakeRepository{}
	service := NewService(repo)
	settings, err := service.Update(context.Background(), "default", "  https://ai.example.com/remoteEntry.js  ")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if settings.RemoteURL != "https://ai.example.com/remoteEntry.js" {
		t.Fatalf("unexpected url: %q", settings.RemoteURL)
	}
	if repo.saved == nil {
		t.Fatal("expected repository.Save to be called")
	}
}

func TestUpdateAllowsEmptyURL(t *testing.T) {
	service := NewService(&fakeRepository{})
	settings, err := service.Update(context.Background(), "default", "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if settings.RemoteURL != "" {
		t.Fatalf("expected empty url, got %q", settings.RemoteURL)
	}
}

func TestGetReturnsEmptyWhenMissing(t *testing.T) {
	service := NewService(&fakeRepository{stored: nil})
	settings, err := service.Get(context.Background(), "tenant-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if settings.TenantID != "tenant-1" || settings.RemoteURL != "" {
		t.Fatalf("unexpected settings: %+v", settings)
	}
}
