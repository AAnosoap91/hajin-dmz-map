
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const filePath = path.resolve('public/keys.json')

const rl = readline.createInterface({ input, output })

try {
  // 1. 读取现有钥匙信息
  const keys = JSON.parse(
    fs.readFileSync(filePath, 'utf8')
  )

  if (!Array.isArray(keys)) {
    throw new Error('keys.json 必须是数组')
  }

  // 2. 输入新钥匙信息
  console.log('\n=== HAJIN DMZ 钥匙录入工具 ===\n')

  const name = (await rl.question('钥匙名称：')).trim()
  const xInput = (await rl.question('X 坐标：')).trim()
  const yInput = (await rl.question('Y 坐标：')).trim()
  const colorInput = (
  await rl.question('钥匙颜色（蓝色/紫色/金色/红色）：')
).trim()

const colorMap = {
  '蓝色': 'blue',
  '紫色': 'purple',
  '金色': 'gold',
  '红色': 'red'
}

const color = colorMap[colorInput]

if (!color) {
  throw new Error('颜色只能是蓝色、紫色、金色或红色')
}

  const x = Number(xInput)
  const y = Number(yInput)

  // 3. 检查输入
  if (!name) {
    throw new Error('钥匙名称不能为空')
  }

  if (
    !xInput || !yInput ||
    !Number.isFinite(x) || !Number.isFinite(y) ||
    x < 0 || x > 2048 ||
    y < 0 || y > 2048
  ) {
    throw new Error('X/Y 坐标必须在 0～2048 之间')
  }

  // 避免重复添加同名钥匙
  if (keys.some(key => key.name === name)) {
    throw new Error('这把钥匙已经存在，请检查 keys.json')
  }

  // 4. 自动生成唯一 ID
  const existingIds = new Set(keys.map(key => key.id))
  let number = 1
  let id

  do {
    id = `key_${String(number).padStart(3, '0')}`
    number++
  } while (existingIds.has(id))

  // 5. 创建新钥匙
  const newKey = {
  id,
  name,
  aliases: [],
  color,
  x,
  y,
  description: '',
  image: null,
  verified: false,
  source: ''
}

  // 6. 添加到数组并写回 JSON 文件
  keys.push(newKey)

  fs.writeFileSync(
    filePath,
    JSON.stringify(keys, null, 2) + '\n',
    'utf8'
  )

  console.log('\n✓ 钥匙添加成功！')
  console.log(`编号：${id}`)
  console.log(`名称：${name}`)
  console.log(`坐标：X ${x}, Y ${y}`)
  console.log('图片：暂无')
  console.log('保存位置：public/keys.json')

} catch (error) {
  console.error('\n✗ 添加失败：', error.message)
  process.exitCode = 1
} finally {
  rl.close()
}
