package main

import (
	"log"
	"os"

	"github.com/GeWu-academy/Modu/apps/api/internal/infrastructure/database"
	"github.com/GeWu-academy/Modu/apps/api/internal/modules/ai"
	transporthttp "github.com/GeWu-academy/Modu/apps/api/internal/transport/http"
)

func main() {
	dsn := os.Getenv("API_DATABASE_URL")
	if dsn == "" {
		log.Fatal("API_DATABASE_URL is required")
	}

	db, err := database.Open(dsn)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	if err := database.Migrate(db); err != nil {
		log.Fatalf("run migrations: %v", err)
	}

	settingsService := ai.NewService(ai.NewGormRepository(db))
	router := transporthttp.NewRouter(settingsService, os.Getenv("API_ADMIN_TOKEN"))

	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("API listening on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
