/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

import UsersController from '#controllers/users_controller'
import CoursesController from '#controllers/courses_controller'
import EnrollmentsController from '#controllers/enrollments_controller'
import ModulesController from '#controllers/modules_controller'
import ProgressController from '#controllers/progress_controller'
import CommentsController from '#controllers/comments_controller'
import AssignmentsController from '#controllers/assignments_controller'
import GradesController from '#controllers/grades_controller'
import FilesController from '#controllers/files_controller'
import AuthController from '#controllers/auth_controller'

router.group(() => {
  router.group(() => {
    router.post('/login', [AuthController, 'login']).as('auth.login')
    router.post('/register', [AuthController, 'register']).as('auth.register')
    router.post('/refreshToken', [AuthController, 'refreshToken']).as('auth.refreshToken')
    router.post('/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))

    router.get('/me', [AuthController, 'me']).as('auth.me').use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.post('/createAvatarMe', [AuthController, 'createAvatarMe']).as('auth.createAvatarMe').use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.delete('/deleteAvatarMe/:id', [AuthController, 'deleteAvatarMe']).as('auth.deleteAvatarMe').use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))

  router.group(() => {
    router.get('/', [UsersController, 'index']).use(middleware.auth({ roles: ['admin'] }))
    router.post('/create', [UsersController, 'create']).use(middleware.auth({ roles: ['admin'] }))
    router.get('/show/:id', [UsersController, 'show']).use(middleware.auth({ roles: ['admin'] }))
    router.patch('/update/:id', [UsersController, 'update']).use(middleware.auth({ roles: ['admin'] }))
    router.delete('/destroy/:id', [UsersController, 'destroy']).use(middleware.auth({ roles: ['admin'] }))
  }).prefix('users')

  router.group(() => {
    router.get('/', [CoursesController, 'index']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.post('/create', [CoursesController, 'create']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
    router.get('/show/:id', [CoursesController, 'show']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.patch('/update/:id', [CoursesController, 'update']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
    router.delete('/destroy/:id', [CoursesController, 'destroy']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
  }).prefix('courses')

  router.group(() => {
    router.get('/', [EnrollmentsController, 'index']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
    router.post('/create', [EnrollmentsController, 'create']).use(middleware.auth({ roles: ['admin', 'student'] }))
    router.get('/show/:id', [EnrollmentsController, 'show']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
    router.patch('/update/:id', [EnrollmentsController, 'update']).use(middleware.auth({ roles: ['admin', 'student'] }))
    router.delete('/destroy/:id', [EnrollmentsController, 'destroy']).use(middleware.auth({ roles: ['admin', 'student'] }))
  }).prefix('enrollments')

  router.group(() => {
    router.get('/', [ModulesController, 'index']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))  
    router.post('/create', [ModulesController, 'create']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
    router.get('/show/:id', [ModulesController, 'show']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] })) 
    router.patch('/update/:id', [ModulesController, 'update']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
    router.delete('/destroy/:id', [ModulesController, 'destroy']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
  }).prefix('modules')

  router.group(() => {
    router.get('/', [ProgressController, 'index']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] })) 
    router.post('/create', [ProgressController, 'create']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] })) 
    router.get('/show/:id', [ProgressController, 'show']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.patch('/update/:id', [ProgressController, 'update']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
    router.delete('/destroy/:id', [ProgressController, 'destroy']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
  }).prefix('progress')

  router.group(() => {
    router.get('/', [CommentsController, 'index']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.post('/create', [CommentsController, 'create']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.get('/show/:id', [CommentsController, 'show']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.patch('/update/:id', [CommentsController, 'update']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.delete('/destroy/:id', [CommentsController, 'destroy']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
  }).prefix('comments')

  router.group(() => {
    router.get('/', [AssignmentsController, 'index']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.post('/create', [AssignmentsController, 'create']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
    router.get('/show/:id', [AssignmentsController, 'show']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.patch('/update/:id', [AssignmentsController, 'update']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
    router.delete('/destroy/:id', [AssignmentsController, 'destroy']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
  }).prefix('assignments')

  router.group(() => {
    router.get('/', [GradesController, 'index']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.post('/create', [GradesController, 'create']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
    router.get('/show/:id', [GradesController, 'show']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.patch('/update/:id', [GradesController, 'update']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
    router.delete('/destroy/:id', [GradesController, 'destroy']).use(middleware.auth({ roles: ['admin', 'teacher'] }))
  }).prefix('grades')

  router.group(() => {
    router.get('/', [FilesController, 'index']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.post('/create', [FilesController, 'create']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.get('/show/:id', [FilesController, 'show']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.patch('/update/:id', [FilesController, 'update']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
    router.delete('/destroy/:id', [FilesController, 'destroy']).use(middleware.auth({ roles: ['admin', 'teacher', 'student'] }))
  }).prefix('files')

  }).prefix('/auth')

}).prefix('api')

router.any('*', async ({ response }) => {
  return response.status(404).json({
    message: 'Ресурс не найден',
  })
})
