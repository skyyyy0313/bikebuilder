import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('开始种子数据...')

  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const hashedUserPassword = await bcrypt.hash('user123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedAdminPassword,
      name: 'Admin',
      isAdmin: true,
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: hashedUserPassword,
      name: 'Test User',
      isAdmin: false,
    },
  })

  await prisma.frame.create({
    data: {
      brand: 'Specialized',
      model: 'Tarmac SL7',
      frameWeight: 800,
      forkWeight: 400,
      seatpostWeight: 0,
      type: '碟刹',
      material: '碳纤维',
      color: 'Red',
      size: '56cm',
      bottomBracketStandard: 'BB386',
    },
  })

  await prisma.frame.create({
    data: {
      brand: 'Trek',
      model: 'Emonda SLR',
      frameWeight: 750,
      forkWeight: 380,
      seatpostWeight: 150,
      type: '碟刹',
      material: '碳纤维',
      color: 'Black',
      size: '54cm',
      bottomBracketStandard: 'T47',
    },
  })

  await prisma.handlebar.create({
    data: {
      brand: 'Enve',
      model: 'SES AR',
      weight: 250,
      isIntegrated: false,
      width: '42cm',
      stemLength: '100mm',
    },
  })

  await prisma.stem.create({
    data: {
      brand: 'Zipp',
      model: 'Service Course SL',
      weight: 120,
      length: '110mm',
      angle: '6度',
    },
  })

  await prisma.wheelset.create({
    data: {
      brand: 'Zipp',
      model: '404 Firecrest',
      weight: 1450,
      rimDepth: '58mm',
      rimWidth: '25mm',
      hubType: 'Center Lock',
      spokeCount: 24,
    },
  })

  await prisma.tire.create({
    data: {
      brand: 'Continental',
      model: 'GP5000',
      weight: 240,
      width: '28mm',
      type: 'Clincher',
    },
  })

  await prisma.innerTube.create({
    data: {
      brand: 'Vittoria',
      model: 'Latex',
      weight: 90,
      valveType: 'Presta',
    },
  })

  await prisma.bottomBracket.create({
    data: {
      brand: 'Chris King',
      model: 'ThreadFit 24',
      weight: 120,
      standard: 'BSA',
      spindleType: '24mm',
    },
  })

  await prisma.saddle.create({
    data: {
      brand: 'Fizik',
      model: 'Antares R3',
      weight: 210,
      width: '143mm',
      rails: 'Carbon',
    },
  })

  await prisma.barTape.create({
    data: {
      brand: 'Supacaz',
      model: 'Super Sticky Kush',
      weight: 85,
      color: 'Black',
      material: 'Cork',
    },
  })

  await prisma.pedal.create({
    data: {
      brand: 'Shimano',
      model: 'PD-R9100',
      weight: 228,
      type: 'Road',
      platform: 'Carbon',
    },
  })

  await prisma.shiftLever.create({
    data: {
      brand: 'Shimano',
      model: 'Dura-Ace R9200',
      weight: 315,
      speed: 12,
      side: 'Right',
    },
  })

  await prisma.frontDerailleur.create({
    data: {
      brand: 'Shimano',
      model: 'Dura-Ace R9200',
      weight: 82,
      speed: 12,
      mountType: 'Braze-on',
    },
  })

  await prisma.rearDerailleur.create({
    data: {
      brand: 'Shimano',
      model: 'Dura-Ace R9200',
      weight: 214,
      speed: 12,
      cageSize: 'Short',
    },
  })

  await prisma.crank.create({
    data: {
      brand: 'Shimano',
      model: 'Dura-Ace R9200',
      weight: 620,
      length: '172.5mm',
      boltCircle: '110mm',
    },
  })

  await prisma.chainring.create({
    data: {
      brand: 'Shimano',
      model: 'Dura-Ace R9200',
      weight: 140,
      teeth: 52,
      bolts: 4,
    },
  })

  await prisma.chain.create({
    data: {
      brand: 'Shimano',
      model: 'Dura-Ace R9200',
      weight: 257,
      speed: 12,
      length: '116 links',
    },
  })

  await prisma.cassette.create({
    data: {
      brand: 'Shimano',
      model: 'Dura-Ace R9200',
      weight: 228,
      speeds: 12,
      range: '11-30T',
    },
  })

  await prisma.seatpost.create({
    data: {
      brand: 'Thomson',
      model: 'Masterpiece',
      length: '300mm',
      diameter: '27.2mm',
      weight: 180,
      material: '铝合金',
    },
  })

  await prisma.seatpost.create({
    data: {
      brand: 'Ritchey',
      model: 'Superlogic',
      length: '350mm',
      diameter: '31.6mm',
      weight: 145,
      material: '碳纤维',
    },
  })

  await prisma.bike.create({
    data: {
      name: '我的第一辆自行车',
      userId: user.id,
    },
  })

  console.log('种子数据完成！')
  console.log(`管理员: ${admin.email} (密码: admin123)`)
  console.log(`普通用户: ${user.email} (密码: user123)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })