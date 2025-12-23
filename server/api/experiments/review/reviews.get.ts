export default defineEventHandler(async()=>{
  const reviews = await prisma.review.findMany({
    include:{
      sectionsCritiques: true
    }
  })
  return reviews
})