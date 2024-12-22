import vine from '@vinejs/vine'

export const courseValidator = vine.compile(
  vine.object({
    title: vine.string().trim(),
    description: vine.string().trim().optional(),
    teacher_id: vine.number()
  })
)