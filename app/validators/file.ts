import vine from '@vinejs/vine'

export const createFileValidator = vine.compile(
  vine.object({
    resource_type: vine.string().trim(),
    resource_id: vine.number(),
    file: vine.file()
  })
)

export const updateFileValidator = vine.compile(
  vine.object({
    file: vine.file()
  })
)