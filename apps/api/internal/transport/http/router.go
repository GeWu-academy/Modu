package http

import (
	"github.com/gin-gonic/gin"
)

// NewRouter 组装 HTTP 路由。
func NewRouter(adminToken string) *gin.Engine {
	router := gin.Default()
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := router.Group("/api/v1")
	api.Use(adminAuth(adminToken))

	return router
}
