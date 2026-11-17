package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type healthResponse struct {
	Status string `json:"status"`
}

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(healthResponse{Status: "ok"}); err != nil {
			http.Error(w, "failed to encode response", http.StatusInternalServerError)
		}
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("backend listening on http://localhost:" + port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
