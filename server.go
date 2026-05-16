package main

import (
	"fmt"
	"net/http"
)


func Handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello waffer fans!")
}

func Handler1(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
}


func main() {
		http.HandleFunc("/", Handler1)
		http.HandleFunc("/next", Handler)
		http.ListenAndServe(":5000", nil)
}
