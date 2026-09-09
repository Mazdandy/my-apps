import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const url = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url })
const db = new PrismaClient({ adapter })

const SALT_ROUNDS = 10

const now = new Date()
const eventDate = new Date('2026-11-28T09:00:00+07:00')

async function main() {
  console.log('Seeding database...')

  // Clean existing data (idempotent reseed)
  await db.wish.deleteMany()
  await db.rsvp.deleteMany()
  await db.guest.deleteMany()
  await db.invitation.deleteMany()
  await db.payment.deleteMany()
  await db.subscription.deleteMany()
  await db.template.deleteMany()
  await db.user.deleteMany()
  await db.plan.deleteMany()

  // --- Users ---
  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS)
  const userPassword = await bcrypt.hash('user123', SALT_ROUNDS)

  const admin = await db.user.create({
    data: {
      name: 'FAAS Admin',
      email: 'admin@faas.id',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })

  const demoUser = await db.user.create({
    data: {
      name: 'Raka & Ayu',
      email: 'user@faas.id',
      passwordHash: userPassword,
      role: 'USER',
    },
  })

  // --- Plans ---
  const freePlan = await db.plan.create({
    data: {
      code: 'FREE',
      name: 'Free Trial',
      description: 'Coba buat satu undangan gratis.',
      price: 0,
      period: 'MONTHLY',
      periodDays: 30,
      maxPages: 1,
      maxGuests: 50,
      freeTemplates: true,
      analytics: false,
      noBranding: false,
      sortOrder: 1,
    },
  })

  const proPlan = await db.plan.create({
    data: {
      code: 'PRO',
      name: 'Pro',
      description: 'Untuk momen spesial dengan fitur lengkap.',
      price: 99000,
      period: 'QUARTERLY',
      periodDays: 90,
      maxPages: 3,
      maxGuests: 500,
      freeTemplates: true,
      analytics: true,
      noBranding: true,
      sortOrder: 2,
    },
  })

  const businessPlan = await db.plan.create({
    data: {
      code: 'BUSINESS',
      name: 'Business',
      description: 'Tanpa batas untuk acara besar & profesional.',
      price: 199000,
      period: 'SEMIANNUAL',
      periodDays: 180,
      maxPages: 0, // unlimited
      maxGuests: 0, // unlimited
      freeTemplates: false,
      analytics: true,
      noBranding: true,
      sortOrder: 3,
    },
  })

  // --- Templates ---
  const templates = [
    {
      name: 'Syari Ivory',
      slug: 'syari-ivory',
      category: 'wedding',
      description: 'Tema elegan bernuansa islami dengan sentuhan ivory.',
      price: 0,
      free: true,
      sortOrder: 1,
    },
    {
      name: 'The Old Stone',
      slug: 'the-old-stone',
      category: 'wedding',
      description: 'Nuansa klasik batu alam yang mewah dan timeless.',
      price: 150000,
      free: false,
      sortOrder: 2,
    },
    {
      name: 'Reflection Grass',
      slug: 'reflection-grass',
      category: 'wedding',
      description: 'Segar dan natural dengan aksen hijau rumput.',
      price: 150000,
      free: false,
      sortOrder: 3,
    },
    {
      name: 'Golden Blossom',
      slug: 'golden-blossom',
      category: 'wedding',
      description: 'Keemasan elegan dengan detail bunga mekar.',
      price: 0,
      free: true,
      sortOrder: 4,
    },
    {
      name: 'Rustic Garden',
      slug: 'rustic-garden',
      category: 'birthday',
      description: 'Hangat dan ceria, cocok untuk ulang tahun.',
      price: 0,
      free: true,
      sortOrder: 5,
    },
  ]

  for (const t of templates) {
    await db.template.create({ data: t })
  }

  // --- Subscription (demo user on Pro) ---
  const subscription = await db.subscription.create({
    data: {
      userId: demoUser.id,
      planId: proPlan.id,
      status: 'ACTIVE',
      startsAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
    },
  })

  await db.payment.create({
    data: {
      userId: demoUser.id,
      subscriptionId: subscription.id,
      amount: proPlan.price,
      gateway: 'mock',
      status: 'PAID',
      reference: `PAY-${randomUUID().slice(0, 8).toUpperCase()}`,
      paidAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
  })

  // --- Invitation ---
  const freeTemplate = await db.template.findUniqueOrThrow({
    where: { slug: 'syari-ivory' },
  })

  const invitationData = {
    groom: {
      name: 'Raka Pratama',
      fullName: 'Raka Aditya Pratama, S.T.',
      nickname: 'Raka',
      instagram: '@raka.pratama',
      sonOf: 'Putra pertama dari Bapak Hendra & Ibu Sri',
    },
    bride: {
      name: 'Ayu Lestari',
      fullName: 'Ayu Lestari, S.Psi.',
      nickname: 'Ayu',
      instagram: '@ayulestari',
      daughterOf: 'Putri pertama dari Bapak Bambang & Ibu Dewi',
    },
    quote: 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.',
    quoteSource: 'QS. Ar-Rum: 21',
    event: {
      title: 'Akad & Resepsi',
      date: '2026-11-28',
      time: '09:00 - 14:00 WIB',
      venue: 'The Garden Ballroom, Hotel Mulia Senayan',
      address: 'Jl. Asia Afrika No. 8, Senayan, Jakarta Pusat',
      mapsUrl: 'https://maps.google.com/?q=Hotel+Mulia+Senayan',
    },
    story: [
      {
        title: 'Pertemuan Pertama',
        date: 'Juni 2021',
        text: 'Kami bertemu di sebuah acara komunitas di Bandung. Tanpa sengaja, takdir mempertemukan kami dalam satu meja diskusi.',
      },
      {
        title: 'Berjalan Berdua',
        date: 'Februari 2023',
        text: 'Setelah dua tahun saling mengenal, kami memutuskan untuk melangkah lebih serius dan memperkenalkan satu sama lain ke keluarga.',
      },
      {
        title: 'Lamaran',
        date: 'Juli 2026',
        text: 'Di hadapan keluarga besar, Raka melamar Ayu dengan restu kedua orang tua.',
      },
    ],
    gift: {
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountName: 'Raka Aditya Pratama',
      address: 'Jl. Melati No. 12, Jakarta Selatan',
    },
    streaming: {
      url: 'https://youtube.com/live/example',
    },
    dresscode: 'Formal / Warna Ivory & Sage',
    gallery: [],
    sections: {
      story: true,
      gift: true,
      streaming: false,
      gallery: true,
      dresscode: true,
      maps: true,
    },
  }

  const invitation = await db.invitation.create({
    data: {
      userId: demoUser.id,
      templateId: freeTemplate.id,
      slug: 'raka-ayu',
      status: 'PUBLISHED',
      title: 'Raka & Ayu',
      data: JSON.stringify(invitationData),
      eventAt: eventDate,
      publishedAt: now,
      expiresAt: new Date(eventDate.getTime() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  // --- Guests ---
  const guestDefs = [
    { name: 'Bapak Hendra & Ibu Sri', group: 'Keluarga Groom', phone: '081234567801' },
    { name: 'Bapak Bambang & Ibu Dewi', group: 'Keluarga Bride', phone: '081234567802' },
    { name: 'Keluarga Besar Wijaya', group: 'Keluarga Groom', phone: '081234567803' },
    { name: 'Sdr. Dimas Saputra', group: 'Teman Groom', phone: '081234567804' },
    { name: 'Sdri. Nadia Putri', group: 'Teman Bride', phone: '081234567805' },
    { name: 'Bapak Anton & Ibu Rina', group: 'Rekan Kerja', phone: '081234567806' },
  ]

  const guestRecords: Record<string, string> = {}
  for (const g of guestDefs) {
    const guest = await db.guest.create({
      data: {
        invitationId: invitation.id,
        name: g.name,
        group: g.group,
        phone: g.phone,
        token: randomUUID(),
        sentStatus: true,
        openedAt: Math.random() > 0.3 ? new Date(now.getTime() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000) : null,
      },
    })
    guestRecords[g.name] = guest.id
  }

  // --- RSVPs ---
  const rsvpDefs = [
    { name: 'Bapak Hendra & Ibu Sri', status: 'YES', adult: 2, child: 0 },
    { name: 'Bapak Bambang & Ibu Dewi', status: 'YES', adult: 2, child: 0 },
    { name: 'Keluarga Besar Wijaya', status: 'YES', adult: 4, child: 2 },
    { name: 'Sdr. Dimas Saputra', status: 'MAYBE', adult: 1, child: 0 },
    { name: 'Sdri. Nadia Putri', status: 'NO', adult: 1, child: 0 },
  ]

  for (const r of rsvpDefs) {
    await db.rsvp.create({
      data: {
        invitationId: invitation.id,
        guestId: guestRecords[r.name],
        status: r.status as 'YES' | 'MAYBE' | 'NO',
        qtyAdult: r.adult,
        qtyChild: r.child,
      },
    })
  }

  // --- Wishes ---
  const wishDefs = [
    { name: 'Bapak Hendra & Ibu Sri', message: 'Selamat menempuh hidup baru, semoga menjadi keluarga yang sakinah, mawaddah, warahmah. 🤲' },
    { name: 'Sdr. Dimas Saputra', message: 'Congrats bro! Akhirnya nikah juga. Semoga langgeng sampai kakek-nenek!' },
    { name: 'Sdri. Nadia Putri', message: 'Selamat ya Ayu & Raka! Semoga selalu bahagia dan diberkahi. 💐' },
    { name: 'Bapak Anton & Ibu Rina', message: 'Selamat menikah! Semoga menjadi keluarga yang harmonis dan penuh berkah.' },
  ]

  for (const w of wishDefs) {
    await db.wish.create({
      data: {
        invitationId: invitation.id,
        name: w.name,
        message: w.message,
      },
    })
  }

  const summary = {
    users: 2,
    plans: 3,
    templates: templates.length,
    invitations: 1,
    guests: guestDefs.length,
    rsvps: rsvpDefs.length,
    wishes: wishDefs.length,
  }
  console.log('Seed complete:', JSON.stringify(summary, null, 2))
  console.log('\nLogin credentials:')
  console.log('  Admin: admin@faas.id / admin123')
  console.log('  User : user@faas.id / user123')
  console.log('  Invitation link: http://localhost:3000/u/raka-ayu')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
