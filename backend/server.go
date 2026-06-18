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
    OrdersCount int      `json:"-"`
}

var maids = []Maid{
    {ID: 1, Name: "Sugar", WelcomeText: "Добро пожаловать в ВаффлеВиль, мир мечты и сладких вафель", ImagePath: "../image/Sugar.png", Position: "left"},
    {ID: 2, Name: "Berry", WelcomeText: "Наши вафли готовятся только из натуральных продуктов", ImagePath: "../image/Berry.png", Position: "right"},
    {ID: 3, Name: "Milky", WelcomeText: "Вафли вафли и еще раз вафли", ImagePath: "../image/Milky.png", Position: "left"},
}

var cardProducts = []Product {
    {ID: 1, Name: "Вафли", Discription: "Просто вафли", Price: 150, Tags: []string{"мягкие", "тёплые", "нежные"}, ImagePath: "../image/WafleBase.JPG", OrdersCount: 120},
    {ID: 2, Name: "НеВафли", Discription: "Не просто вафли", Price: 100000, Tags: []string{"не мягкие", "не тёплые", "не нежные"}, ImagePath: "../image/WafleBase.JPG", OrdersCount: -1},
    {ID: 3, Name: "Ваффли", Discription: "Просто вафли", Price: 150, Tags: []string{"мягкие", "тёплые", "нежные"}, ImagePath: "../image/WafleBase.JPG", OrdersCount: 90},
    {ID: 4, Name: "Ваафли", Discription: "Просто вафли", Price: 150, Tags: []string{"мягкие", "тёплые", "нежные"}, ImagePath: "../image/WafleBase.JPG", OrdersCount: 70},
    {ID: 5, Name: "Ввафли", Discription: "Просто вафли", Price: 150, Tags: []string{"мягкие", "тёплые", "нежные"}, ImagePath: "../image/WafleBase.JPG", OrdersCount: 10},
}

func topProductsHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    
    sorted := sortByPopularity(cardProducts)
    
    result := sorted
    if len(result) > 5 {
        result = result[:5]
    }
    
    json.NewEncoder(w).Encode(result)
}

func sortByPopularity(items []Product) []Product {
    sorted := make([]Product, len(items))
    copy(sorted, items)
    
    for i := 0; i < len(sorted); i++ {
        for j := i + 1; j < len(sorted); j++ {
            if sorted[i].OrdersCount < sorted[j].OrdersCount {
                sorted[i], sorted[j] = sorted[j], sorted[i]
            }
        }
    }
    return sorted
}

/* Вспомогательные функции, дабы в будущем при массивной БД товаров сделать карточки по тегам */
func getUserFavoriteTags(userID string) []string {
    // СЮДА ПОТОМ БУДЕТ ЗАПРОС К БД ПО ТЕГАМ, КОТОРЫЕ ЧАЩЕ ВСЕГО ЗАКАЗЫВАЕТ АККАУНТ
    return []string{"мягкие", "тёплые"}
}

func getProductsByTags(allProducts []Product, tags []string) []Product {
    var result []Product
    
    for _, p := range allProducts {
        for _, tag := range tags {
            if contains(p.Tags, tag) {
                result = append(result, p)
                break
            }
        }
    }
    return result
}

func contains(slice []string, item string) bool {
    for _, s := range slice {
        if s == item {
            return true
        }
    }
    return false
}

func removeDuplicates(items []Product, exclude []Product) []Product {
    var result []Product
    
    for _, item := range items {
        isExcluded := false
        for _, ex := range exclude {
            if item.ID == ex.ID {
                isExcluded = true
                break
            }
        }
        if !isExcluded {
            result = append(result, item)
        }
    }
    return result
}

func shuffle(items []Product) {
    for i := range items {
        j := rand.Intn(i + 1)
        items[i], items[j] = items[j], items[i]
    }
}
/* --- */

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
    http.HandleFunc("/api/productCards", topProductsHandler)
    http.HandleFunc("/", indexHandler)
    
    // Запускаем сервер
    fmt.Println("\n🚀 Сервер запущен на http://localhost:5000")
    fmt.Println("📡 API-Maids: http://localhost:5000/api/random-maid")
    fmt.Println("📡 API-Cards_Speshl: http://localhost:5000/api/productCards")
    fmt.Println("\nНажми Ctrl+C для остановки")
    
    http.ListenAndServe(":5000", nil)
}
