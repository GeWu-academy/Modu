package http

import (
	"github.com/gin-gonic/gin"

	"github.com/GeWu-academy/Modu/apps/api/internal/modules/ai"
)

// NewRouter 组装 HTTP 路由。
func NewRouter(settingsService *ai.Service, adminToken string) *gin.Engine {
	router := gin.Default()
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := router.Group("/api/v1")
	api.Use(adminAuth(adminToken))
	handler := &AISettingsHandler{service: settingsService}
	api.GET("/ai/module-settings", handler.Get)
	api.PUT("/ai/module-settings", handler.Update)

	return router
}
