import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  })
  
  prisma.$on('query', (e) => {
    dbLogger.debug(e.query, { params: e.params })
  })
  prisma.$on('error', (e) => {
    dbLogger.error(e.message)
  })
  prisma.$on('info', (e) => {
    dbLogger.info(e.message)
  })
  prisma.$on('warn', (e) => {
    dbLogger.warn(e.message)
  })
  
  return prisma
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma
