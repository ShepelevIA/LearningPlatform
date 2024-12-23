import vine from '@vinejs/vine'

export const courseValidator = vine.compile(
  vine.object({
    title: vine.string().trim(),
    description: vine.string().optional(),
    teacher_id: vine.number()
  })
)