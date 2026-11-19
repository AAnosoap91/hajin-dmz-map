
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const filePath = path.resolve('public/keys.json')

const colorMap = {
  blue: 'blue',
  purple: 'purple',
  gold: 'gold',
  red: 'red',
  蓝色: 'blue',
  紫色: 'purple',
  金色: 'gold',
  红色: 'red'
}

async function main() {
  const keys = JSON.parse(
    fs.readFileSync(filePath, 'utf8')
  )

  if (!Array.isArray(keys)) {
    throw new Error('keys.json 格式错误，必须是数组')
  }

  let [name, xText, yText, colorText] =
    process.argv.slice(2)

  // 没有提供参数时，使用交互模式
  if (process.argv.length <= 2) {
    const rl = readline.createInterface({
      input: stdin,
      output: stdout
    })

    try {
      name = await rl.question('钥匙名称：')
      xText = await rl.question('X 坐标：')
      yText = await rl.question('Y 坐标：')
      colorText = await rl.question(
        '颜色（蓝色/紫色/金色/红色）：'
      )
    } finally {
      rl.close()
    }
  }

  name = name?.trim()
  const x = Number(xText)
  const y = Number(yText)
  const color = colorMap[colorText?.trim()]

  if (!name) {
    throw new Error('钥匙名称不能为空')
  }

  if (
    !xText?.trim() ||
    !yText?.trim() ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    x < 0 || x > 2048 ||
    y < 0 || y > 2048
  ) {
    throw new Error('坐标必须在 0～2048 之间')
  }

  if (!color) {
    throw new Error('颜色只能是蓝、紫、金、红')
  }

  // 只阻止名称和坐标完全相同的重复记录
const duplicate = keys.some(key =>
  key.name.trim().toLowerCase() === name.toLowerCase() &&
  key.x === x &&
  key.y === y
)

if (duplicate) {
  throw new Error('相同名称和坐标的记录已经存在')
}

  // 自动生成不重复的 ID
  const existingIds = new Set(
    keys.map(key => key.id)
  )

  let n = 1
  let id

  do {
    id = `key_${String(n).padStart(3, '0')}`
    n++
  } while (existingIds.has(id))

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

  keys.push(newKey)

  fs.writeFileSync(
    filePath,
    JSON.stringify(keys, null, 2) + '\n',
    'utf8'
  )

  console.log('\n✓ 添加成功！')
  console.log(`${name} | ${color} | X:${x} Y:${y}`)
  console.log(`已保存到：${filePath}`)
}

main().catch(error => {
  console.error('✗', error.message)
  process.exitCode = 1
})
