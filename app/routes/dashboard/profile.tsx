import { Form, useOutletContext } from 'react-router'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Heading } from '~/components/ui/heading'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { logger } from '~/lib/logger'
import { commitSession, getSession, setSessionData, type SessionData } from '~/lib/session'
import { updateUserName } from '~/services/user/user.service'
import { profileSchema } from '~/validation/auth'
import type { Route } from './+types/profile'

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const session = await getSession(request.headers.get('Cookie'))
    const formData = await request.formData()
    const data = await profileSchema.parseAsync(Object.fromEntries(formData))
    const updatedUser = await updateUserName(data.userId, data.name)

    setSessionData(session, {
      userId: updatedUser.userId,
      email: updatedUser.email,
      name: updatedUser.name,
      sessionId: session.get('sessionId')!,
    })

    return new Response(null, {
      status: 200,
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    })
  } catch (error) {
    logger.error(error, 'Profile Action Error')
  }
}

export const Profile = () => {
  const userData = useOutletContext<SessionData>()
  return (
    <>
      <div>
        <Heading>Profile information</Heading>
        <Form onSubmitCapture={() => toast('Profile updated successfully')} method='POST' className='flex flex-col justify-end gap-4'>
          <input type='hidden' name='userId' value={userData.userId} />
          <div className='grid grid-cols-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              name='name'
              defaultValue={userData?.name ?? ''}
              placeholder={userData?.name ?? 'Update your name'}
            />
          </div>
          <div className='grid grid-cols-2'>
            <Label htmlFor='email'>Email Address</Label>
            <Input
            disabled
              id='email'
              name='email'
              defaultValue={userData.email}
              placeholder='User email'
              className='cursor-not-allowed'
            />
          </div>
          <Button type='submit' className='mt-4 self-end'>
            Save Changes
          </Button>
        </Form>
      </div>
    </>
  )
}
export default Profile
