package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"path/filepath"
	"time"
)

// ---------- Структуры ----------
type Maid struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	WelcomeText string `json:"welcomeText"`
	ImagePath   string `json:"imagePath"`
	Position    string `json:"position"`
}

type Product struct {
	ID            int      `json:"id"`
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	Price         int      `json:"price"`
	Tags          []string `json:"tags"`
	ImagePath     string   `json:"imagePath"`
	PurchaseCount int      `json:"-"` 
}

type Account struct {
	ID           int    `json:"id"`
	Login        string `json:"login"`
	Email        string `json:"email"`
	PasswordHash string `json:"-"` 
	Phone        string `json:"phone,omitempty"`
	Address      string `json:"address,omitempty"`
}

// ---------- Статические данные (горничные) ----------
var maids = []Maid{
	{ID: 1, Name: "Sugar", WelcomeText: "Добро пожаловать в ВаффлеВиль, мир мечты и сладких вафель", ImagePath: "../image/Sugar.png", Position: "left"},
	{ID: 2, Name: "Berry", WelcomeText: "Наши вафли готовятся только из натуральных продуктов", ImagePath: "../image/Berry.png", Position: "right"},
	{ID: 3, Name: "Milky", WelcomeText: "Вафли вафли и еще раз вафли", ImagePath: "../image/Milky.png", Position: "left"},
}

var chance = []float64{0.3, 0.3, 0.4}

// ---------- Обработчики ----------

// Случайная горничная
func randomMaidHandler(w http.ResponseWriter, r *http.Request) {
	rand.Seed(time.Now().UnixNano())
	rnd := rand.Float64()
	cas := 0.0
	var maid Maid
	for i, m := range maids {
		if i < len(chance) {
			cas += chance[i]
		} else {
			cas += 0.1
		}
		if rnd < cas {
			maid = m
			break
		}
	}
	if maid.ID == 0 {
		maid = maids[0]
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(maid)
}

// Топ-5 товаров из БД
func topProductsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	products, err := GetTopProducts(5) // вызываем функцию из db.go
	if err != nil {
		http.Error(w, "Ошибка получения данных из БД", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(products)
}
// Регистрация нового пользователя
func registerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не разрешён", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Login    string `json:"login"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Phone    string `json:"phone"`
		Address  string `json:"address"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный JSON", http.StatusBadRequest)
		return
	}

	// Проверка данных
	if len(req.Login) < 3 {
		http.Error(w, "Логин минимум 3 символа", http.StatusBadRequest)
		return
	}
	if len(req.Password) < 6 {
		http.Error(w, "Пароль минимум 6 символов", http.StatusBadRequest)
		return
	}

	// Хэшируем пароль
	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Ошибка сервера", http.StatusInternalServerError)
		return
	}

	// Сохраняем в БД
	id, err := CreateAccount(req.Login, req.Email, hashedPassword, req.Phone, req.Address)
	if err != nil {
		// Проверяем, что ошибка из-за дубликата
		if strings.Contains(err.Error(), "Duplicate entry") {
			http.Error(w, "Пользователь с таким логином или email уже существует", http.StatusConflict)
		} else {
			http.Error(w, "Ошибка базы данных: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Регистрация успешна",
		"user": Account{
			ID:      int(id),
			Login:   req.Login,
			Email:   req.Email,
			Phone:   req.Phone,
			Address: req.Address,
		},
	})
}

// Вход пользователя
func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не разрешён", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный JSON", http.StatusBadRequest)
		return
	}

	// Ищем пользователя
	user, err := GetAccountByLoginOrEmail(req.Login)
	if err != nil {
		http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
		return
	}

	// Проверяем пароль
	if !CheckPasswordHash(req.Password, user.PasswordHash) {
		http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
		return
	}

	// Убираем хэш перед отправкой
	user.PasswordHash = ""

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Вход выполнен",
		"user":    user,
	})
}
// Отдача HTML-файла
func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	possiblePaths := []string{"../index.html", "./index.html", "index.html"}
	var html []byte
	var err error
	for _, path := range possiblePaths {
		html, err = os.ReadFile(path)
		if err == nil {
			break
		}
	}
	if err != nil {
		fmt.Fprintf(w, "HTML файл не найден. Проверь путь к index.html")
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write(html)
}

// Поиск директорий со статикой
func findStaticDir(paths ...string) string {
	for _, path := range paths {
		if _, err := os.Stat(path); err == nil {
			absPath, _ := filepath.Abs(path)
			return absPath
		}
	}
	return ""
}

// ---------- main ----------
func main() {
	// 1. Подключение к БД
	if err := InitDB(); err != nil {
		fmt.Println("❌ Ошибка подключения к БД:", err)
		return
	}
	defer DB.Close()

	// 2. Статические файлы
	stylesDir := findStaticDir("../styles", "./styles")
	scriptsDir := findStaticDir("../scripts", "./scripts")
	imagesDir := findStaticDir("../image", "./image")

	if stylesDir != "" {
		http.Handle("/styles/", http.StripPrefix("/styles/", http.FileServer(http.Dir(stylesDir))))
		fmt.Println("✅ Стили подключены из:", stylesDir)
	}
	if scriptsDir != "" {
		http.Handle("/scripts/", http.StripPrefix("/scripts/", http.FileServer(http.Dir(scriptsDir))))
		fmt.Println("✅ Скрипты подключены из:", scriptsDir)
	}
	if imagesDir != "" {
		http.Handle("/image/", http.StripPrefix("/image/", http.FileServer(http.Dir(imagesDir))))
		fmt.Println("✅ Изображения подключены из:", imagesDir)
	}

	// 3. Роуты
	http.HandleFunc("/api/random-maid", randomMaidHandler)
	http.HandleFunc("/api/top-products", topProductsHandler)
	http.HandleFunc("/api/register", registerHandler)   
	http.HandleFunc("/api/login", loginHandler)   
	http.HandleFunc("/", indexHandler)

	// 4. Запуск
	fmt.Println("\n🚀 Сервер запущен на http://localhost:5000")
	fmt.Println("📡 API-Maids: http://localhost:5000/api/random-maid")
	fmt.Println("📡 API-Cards (из БД): http://localhost:5000/api/top-products")
	fmt.Println("\nНажми Ctrl+C для остановки")

	http.ListenAndServe(":5000", nil)
}