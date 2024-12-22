import vine from '@vinejs/vine'

export const assignmentsValidator = vine.compile(
    vine.object({
      module_id: vine.number(),
      title: vine.string().trim(),
      description: vine.string().trim().optional(),
    })
)