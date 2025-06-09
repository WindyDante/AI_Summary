package vo

import "ai-summary-app/internal/model"

type Result[T any] struct {
	Code    int    `json:"code"`
	Message string `json:"msg"`
	Data    T      `json:"data"`
}

func OK[T any](data T, message ...string) Result[T] {
	msg := model.SuccessMessage
	if len(message) > 0 {
		msg = message[0]
	}
	return Result[T]{
		Code:    1,
		Message: msg,
		Data:    data,
	}
}

func Fail[T any](message string) Result[T] {
	var zero T
	return Result[T]{
		Code:    0,
		Message: message,
		Data:    zero,
	}
}

func OKWithCode[T any](data T, code int, messages ...string) Result[T] {
	// 如果没有传入自定义消息，则使用默认消息
	message := model.SuccessMessage
	if len(messages) > 0 {
		message = messages[0] // 如果有自定义消息，就使用它
	}

	return Result[T]{
		Code:    code,
		Message: message,
		Data:    data,
	}
}
