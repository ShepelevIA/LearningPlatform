import vine from '@vinejs/vine'

export const enrllomentsValidator = vine.compile(
  vine.object({
    student_id: vine.number(),
    course_id: vine.number(),
  })
)