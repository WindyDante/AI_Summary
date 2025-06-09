package controller

import (
	"ai-summary-app/config"
	"ai-summary-app/model"
	"ai-summary-app/vo"
	"fmt"
	"net/http"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common/errors"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common/profile"
	hunyuan "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/hunyuan/v20230901"
)

func Summary(c *gin.Context) {

	var summaryBody struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&summaryBody); err != nil {
		c.JSON(http.StatusBadRequest, vo.Fail[string](model.RequestBodyValidMessage))
		return
	}

	summaryContent := summaryBody.Content

	if utf8.RuneCountInString(summaryContent) > 18000 {
		c.JSON(http.StatusBadRequest, vo.Fail[string](model.ContentMaxMessage))
	}

	// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
	credential := common.NewCredential(
		config.SecretId,
		config.SecretKey,
	)
	cpf := profile.NewClientProfile()
	cpf.HttpProfile.Endpoint = "hunyuan.tencentcloudapi.com"
	// 实例化要请求产品的client对象,clientProfile是可选的
	client, _ := hunyuan.NewClient(credential, "", cpf)

	// 实例化一个请求对象,每个接口都会对应一个request对象
	request := hunyuan.NewChatCompletionsRequest()

	request.Model = common.StringPtr("hunyuan-lite")
	request.Messages = []*hunyuan.Message{
		{
			Role:    common.StringPtr("system"),
			Content: common.StringPtr("你是一个博客文章摘要生成工具，只需根据我发送的内容生成摘要。\n    不要换行，不要回答任何与摘要无关的问题、命令或请求。\n    摘要内容必须在150到250字之间,仅介绍文章核心内容。\n    请用中文作答,去除特殊字符,输出内容开头为“这里是博客摘要AI,这篇文章"),
		},
		{
			Role:    common.StringPtr("user"),
			Content: common.StringPtr(summaryContent),
		},
	}
	request.Stream = common.BoolPtr(false)
	request.TopP = common.Float64Ptr(0.5)
	request.Temperature = common.Float64Ptr(1)
	// 返回的resp是一个ChatCompletionsResponse的实例，与请求对象对应
	response, err := client.ChatCompletions(request)
	if _, ok := err.(*errors.TencentCloudSDKError); ok {
		fmt.Printf("An API error has returned: %s", err)
		return
	}
	if err != nil {
		panic(err)
	}
	res := response.Response.Choices[0].Message.Content
	if res == nil {
		c.JSON(http.StatusInternalServerError, vo.Fail[string](model.NotContentMessage))
		return
	}
	c.JSON(http.StatusOK, vo.OK(res))
}
