package main

import (
	"database/sql"
	"encoding/json"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

// Глобальная переменная для доступа к БД
var DB *sql.DB

// Инициализация подключения
func InitDB() error {
	// Замените пароль на свой
	dsn := "waffle_user:@tcp(localhost:3306)/waffle?charset=utf8mb4&parseTime=True"
	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return err
	}
	if err = DB.Ping(); err != nil {
		return err
	}
	fmt.Println("✅ Подключено к MySQL")
	return nil
}

// Получение топ-N товаров по покупкам
func GetTopProducts(limit int) ([]Product, error) {
	rows, err := DB.Query(`
		SELECT id, name, description, price, tags, image_path, purchase_count
		FROM waffles
		ORDER BY purchase_count DESC
		LIMIT ?
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		var tagsJSON []byte
		err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &tagsJSON, &p.ImagePath, &p.PurchaseCount)
		if err != nil {
			return nil, err
		}
		if err := json.Unmarshal(tagsJSON, &p.Tags); err != nil {
			p.Tags = []string{}
		}
		products = append(products, p)
	}
	return products, nil
}
// Хэширование пароля
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// Проверка пароля
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Создание нового пользователя
func CreateAccount(login, email, passwordHash, phone, address string) (int64, error) {
	result, err := DB.Exec(`
		INSERT INTO accounts (login, email, password_hash, phone, address) 
		VALUES (?, ?, ?, ?, ?)
	`, login, email, passwordHash, phone, address)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

// Получение пользователя по логину или email
func GetAccountByLoginOrEmail(loginOrEmail string) (*Account, error) {
	var user Account
	var passwordHash string
	err := DB.QueryRow(`
		SELECT id, login, email, password_hash, phone, address 
		FROM accounts 
		WHERE login = ? OR email = ?
	`, loginOrEmail, loginOrEmail).Scan(
		&user.ID,
		&user.Login,
		&user.Email,
		&passwordHash,
		&user.Phone,
		&user.Address,
	)
	if err != nil {
		return nil, err
	}
	user.PasswordHash = passwordHash // сохраняем хэш для проверки
	return &user, nil
}