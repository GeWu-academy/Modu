package http

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// adminAuth 是过渡期的鉴权：校验静态 admin token。
// 真正的身份与权限校验属于后续的平台 auth（Phase C）。未配置 token 时仅开发环境放行。
func adminAuth(adminToken string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if adminToken == "" {
			c.Next()
			return
		}
		token := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
		if token != adminToken {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		c.Next()
	}
}
