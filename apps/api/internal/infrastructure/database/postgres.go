package database

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Open 建立 PostgreSQL 连接（GORM）。
func Open(dsn string) (*gorm.DB, error) {
	return gorm.Open(postgres.Open(dsn), &gorm.Config{})
}
