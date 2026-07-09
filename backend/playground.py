#概念 1：变量和基本类型
# 字符串（文字）
name = "Echo"
greeting = "你好，未来的自己"

# 整数
year = 2026

# 浮点数（小数）
version = 1.0

# 布尔值（真/假）
is_sent = False

# 打印出来看看
print(name)
print(year)
print(version)


#概念 2：列表和字典（重点）
# 列表：一组有序的东西
echoes = ["今天很开心", "明天会更好", "希望坚持下去"]
print(echoes[0])  # 取第一个元素，输出：今天很开心
print(len(echoes))  # 列表长度，输出：3

# 字典：键值对，像一个标签贴
echo = {
    "content": "今天终于开始学开发了",
    "year": 2026,
    "is_sent": True
}
print(echo["content"])  # 通过键取值
print(echo["year"])


#概念 3：函数
# 定义一个函数：保存一条回声
def save_echo(content):
    print(f"保存了：{content}")
    return True

# 调用函数
result = save_echo("今天天气很好")
print(result)  # 输出：True


#概念 4：类（class）
# 定义一个 Echo 类
class Echo:
    def __init__(self, content, year):
        self.content = content
        self.year = year
    
    def send(self):
        return f"在 {self.year} 年，发送了：{self.content}"

# 创建一个 Echo 实例
my_echo = Echo("坚持就是胜利", 2026)
print(my_echo.send())


#概念 5：异步（async/await）——先了解，不深入
import asyncio

# 一个异步函数
async def fetch_echo_from_future():
    await asyncio.sleep(1)  # 模拟等待（比如等待数据库响应）
    return "一年前的回声"

# 运行异步函数
async def main():
    result = await fetch_echo_from_future()
    print(result)

asyncio.run(main())