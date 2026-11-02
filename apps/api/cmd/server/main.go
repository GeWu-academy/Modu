package main

import (
	"log"
	"os"

	transporthttp "github.com/GeWu-academy/Modu/apps/api/internal/transport/http"
)

func main() {
	router := transporthttp.NewRouter(os.Getenv("API_ADMIN_TOKEN"))

	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("API listening on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
