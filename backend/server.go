package main

import (
    "encoding/json"
    "fmt"
    "math/rand"
    "net/http"
    "os"
    "path/filepath"
    "time"
)

type Maid struct {
    ID          int    `json:"id"`
    Name        string `json:"name"`
    WelcomeText string `json:"welcomeText"`
    ImagePath   string `json:"imagePath"`
    Position    string `json:"position"`
}

type Product struct {
    ID          int      `json:"id"`
    Name        string   `json:"name"`
    Discription string   `json:"discription"`
    Price       int      `json:"price"`
    Tags        []string `json:"tags"`
    ImagePath   string   `json:"imagePath"`
}

var maids = []Maid{
    {ID: 1, Name: "Sugar", WelcomeText: "Добро пожаловать в ВаффлеВиль, мир мечты и сладких вафель", ImagePath: "../image/Sugar.png", Position: "left"},
    {ID: 2, Name: "Berry", WelcomeText: "Наши вафли готовятся только из натуральных продуктов", ImagePath: "../image/Berry.png", Position: "right"},
    {ID: 3, Name: "Milky", WelcomeText: "Вафли вафли и еще раз вафли", ImagePath: "../image/Milky.png", Position: "left"},
}

var cardProducts = []Product {
    {ID: 1, Name: "Вафли", Discription: "Просто вафли", Price: 150, Tags: []string{"мягкие", "тёплые", "нежные"}, ImagePath: "../image/WafleBase.JPG"},
    {ID: 2, Name: "НеВафли", Discription: "Не просто вафли", Price: 100000, Tags: []string{"не мягкие", "не тёплые", "не нежные"}, ImagePath: "../image/WafleBase.JPG"},
}

var chance = []float64 {
    0.3, //Sugar
    0.3, //Berry
    0.4, //Milky
}

func init() {
    rand.Seed(time.Now().UnixNano()) //Инициализация рандомайзера
}

func getRandomMaid() Maid {
    r := rand.Float64()
    cumulative := 0.0

    for i, maid := range maids {
        if i < len(chance) {
            cumulative += chance[i]
        } else {
            cumulative += 0.1
        }
        if r < cumulative {
            return maid
        }
    }
    return maids[0]
}

func randomMaidHandler(w http.ResponseWriter, r *http.Request) {
    maid := getRandomMaid()
    
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    
    json.NewEncoder(w).Encode(maid)
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path != "/" {
        http.NotFound(w, r)
        return
    }
    
    possiblePaths := []string{
        "../index.html",
        "./index.html",
        "index.html",
    }
    
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

func findStaticDir(paths ...string) string {
    for _, path := range paths {
        if _, err := os.Stat(path); err == nil {
            absPath, _ := filepath.Abs(path)
            return absPath
        }
    }
    return ""
}


func main() {
		stylesDir := findStaticDir("../styles", "./styles")
    scriptsDir := findStaticDir("../scripts", "./scripts")
    imagesDir := findStaticDir("../image", "./image")
    
    if stylesDir != "" {
        http.Handle("/styles/", http.StripPrefix("/styles/", http.FileServer(http.Dir(stylesDir))))
        fmt.Println("✅ Стили подключены из:", stylesDir)
    } else {
        fmt.Println("⚠️ Папка styles не найдена")
    }
    
    if scriptsDir != "" {
        http.Handle("/scripts/", http.StripPrefix("/scripts/", http.FileServer(http.Dir(scriptsDir))))
        fmt.Println("✅ Скрипты подключены из:", scriptsDir)
    } else {
        fmt.Println("⚠️ Папка scripts не найдена")
    }
    
    if imagesDir != "" {
        http.Handle("/image/", http.StripPrefix("/image/", http.FileServer(http.Dir(imagesDir))))
        fmt.Println("✅ Изображения подключены из:", imagesDir)
    } else {
        fmt.Println("⚠️ Папка image не найдена")
    }
    
    // Регистрируем обработчики
    http.HandleFunc("/api/random-maid", randomMaidHandler)
    http.HandleFunc("/", indexHandler)
    
    // Запускаем сервер
    fmt.Println("\n🚀 Сервер запущен на http://localhost:5000")
    fmt.Println("📡 API: http://localhost:5000/api/random-maid")
    fmt.Println("\nНажми Ctrl+C для остановки")
    
    http.ListenAndServe(":5000", nil)
}
