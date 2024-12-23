import vine from '@vinejs/vine'

export const moduleValidator = vine.compile(
  vine.object({
    title: vine.string().trim(),
    course_id: vine.number(),
    content: vine.string().optional()
  })
)