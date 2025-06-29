| 功能模块 | 说明 |
| ---------- | ----------------------------- |
| ✅ 广告自动隐藏 | 使用CSS选择器+软隐藏方式屏蔽广告模块 |
| ✅ 跳过可跳广告 | 自动点击“跳过广告”按钮，智能判断显示状态 |
| ✅ 倍速播放广告 | 将广告视频自动提升到 16x 倍速，加快跳过速度 |
| ✅ 广告静音处理 | 避免广告声干扰，广告播放时自动静音，播放后恢复原状态 |
| ✅ AI选择器更新 | 接入GPT-4o模型，实时获取YouTube最新广告选择器 |
| ✅ 容灾机制 | AI服务失效时，回退到本地历史缓存或默认选择器 |
| ✅ 自动自愈 | 每小时检查并更新一次广告CSS规则，确保长期有效 |
| ✅ 本地缓存 | 所有AI返回的选择器都会本地存储，避免重复调用接口 |
| ✅ 请求失败重试机制 | 网络波动时可自动重试3次，增强稳定性 |
| ✅ 极低系统占用 | 每秒钟轻量运行一次核心逻辑，避免浏览器卡顿 |

| 问题 | 说明 |
| -------------- | --------------------------- |
| AI接口请求失败 | 网络问题或接口暂时不可用，脚本会使用历史规则自动容灾 |
| 有广告漏网未屏蔽 | 说明最新广告形式未被覆盖，下次AI更新会自动学习并屏蔽 |
| 倍速播放无效/播放速度未恢复 | 浏览器兼容问题，建议使用Chrome最新版测试 |
| 跳过广告按钮未点击 | YouTube跳过按钮延迟加载，1秒内将尝试再次检测 |
| 页面异常（播放失败/卡顿） | 建议刷新页面，或关闭其他干扰性插件 |
