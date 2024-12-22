import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(4),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    last_name: vine.string().trim(), 
    first_name: vine.string().trim(),
    middle_name: vine.string().trim(),
    email: vine.string().trim().email(),
    role: vine.string().trim().in(['admin', 'teacher', 'student']),
    password: vine.string().trim().minLength(4),
    confirmPassword: vine.string().trim().sameAs('password'),
  })
)