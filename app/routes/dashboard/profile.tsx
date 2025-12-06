import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { SessionData } from "~/lib/session"

export const Profile = (props: SessionData) => {
  return (
    <>
  <div className="">
    <p className="heading">
      Profile information
    </p>
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2">
        <Label htmlFor="name">Name</Label>
       <Input id='name' value={props?.name ?? ''} placeholder={props?.name ?? 'Update your name'}  />
      </div>
      <div className="grid grid-cols-2">
       <Label htmlFor="email">Email Address</Label>
       <Input id='email' type="email" value={props.email} />
      </div>
    </div>
  </div>
</>

  )
}
export default Profile
