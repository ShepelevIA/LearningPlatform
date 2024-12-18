import vine from '@vinejs/vine'

export const createAssignmentsValidator = vine.compile(
    vine.object({
      module_id: vine.number(),
      title: vine.string().trim(),
      description: vine.string().trim().optional(),
    })
  )
  

export const updateAssignmentsValidator = vine.compile(
vine.object({
    module_id: vine.number(),
    title: vine.string().trim(),
    description: vine.string().trim().optional(),
})
)