import vine from '@vinejs/vine'

export const createCommentsValidator = vine.compile(
    vine.object({
      module_id: vine.number(),
      content: vine.string()
    })
  )
  

export const updateCommentsValidator = vine.compile(
vine.object({
    content: vine.string()
})
)