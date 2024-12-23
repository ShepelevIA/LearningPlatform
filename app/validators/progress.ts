import vine from '@vinejs/vine'

export const createProgressValidator = vine.compile(
  vine.object({
    student_id: vine.number(),
    module_id: vine.number(),
    status: vine.string()
  })
)

export const updateProgressValidator = vine.compile(
    vine.object({
        status: vine.string()
    })
)