import vine from '@vinejs/vine'

export const createGradeValidator = vine.compile(
  vine.object({
    student_id: vine.number(),
    assignment_id: vine.number(),
    grade: vine.number(),
    feedback: vine.string().optional()
  })
)

export const updateGradeValidator = vine.compile(
  vine.object({
    grade: vine.number(),
    feedback: vine.string().optional()
  })
)