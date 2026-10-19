package http

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/GeWu-academy/Modu/apps/api/internal/modules/ai"
)

// defaultTenantID 是当前单租户部署的占位租户标识。
const defaultTenantID = "default"

// AISettingsHandler 提供 AI 模块设置的读写接口。
type AISettingsHandler struct {
	service *ai.Service
}

type updateSettingsRequest struct {
	RemoteURL string `json:"remoteUrl"`
}

// Get 返回 AI 模块设置。
func (h *AISettingsHandler) Get(c *gin.Context) {
	settings, err := h.service.Get(c.Request.Context(), defaultTenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "read_failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"remoteUrl": settings.RemoteURL, "updatedAt": settings.UpdatedAt})
}

// Update 更新 AI 模块设置。
func (h *AISettingsHandler) Update(c *gin.Context) {
	var req updateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_body"})
		return
	}
	settings, err := h.service.Update(c.Request.Context(), defaultTenantID, req.RemoteURL)
	if err != nil {
		if errors.Is(err, ai.ErrInvalidRemoteURL) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_remote_url"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "save_failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"remoteUrl": settings.RemoteURL, "updatedAt": settings.UpdatedAt})
}
